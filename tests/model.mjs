import * as tf from '@tensorflow/tfjs';
import fs from 'fs-extra';
import path from 'path';

/**
 * Loads the MobileNet model and returns a decapitated version that outputs internal activations.
 * @returns {Promise<tf.LayersModel>} The decapitated MobileNet model.
 */
async function loadDecapitatedMobileNet() {
    const mobileNet = await tf.loadLayersModel(
        "https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.75_224/model.json"
    );

    // Get the layer that outputs the internal activations.
    const layer = mobileNet.getLayer("conv_pw_13_relu");
    return tf.model({ inputs: mobileNet.inputs, outputs: layer.output });
}

/**
 * Represents a custom model for image classification.
 */
export class ImageClassifierModel {
    constructor() {
        this.currentModelPath = null;
        this.decapitatedMobileNet = null;
        this.model = null;
        this.labels = null;
    }

    /**
     * Initializes the model by loading the MobileNet and setting it up.
     */
    async initialize() {
        this.decapitatedMobileNet = await loadDecapitatedMobileNet();
    }

    /**
     * Builds the retraining model by adding custom layers on top of the MobileNet.
     * @param {number} denseUnits Number of units in the dense layer.
     * @param {number} numClasses Number of classes for classification.
     * @param {number} learningRate Learning rate for model training.
     */
    buildRetrainingModel(denseUnits, numClasses, learningRate) {
        this.model = tf.sequential({
            layers: [
                tf.layers.flatten({
                    inputShape: this.decapitatedMobileNet.outputs[0].shape.slice(1)
                }),
                tf.layers.dense({
                    units: denseUnits,
                    activation: "relu",
                    kernelInitializer: "varianceScaling",
                    useBias: true
                }),
                tf.layers.dense({
                    units: numClasses,
                    kernelInitializer: "varianceScaling",
                    useBias: false,
                    activation: "softmax"
                })
            ]
        });

        const optimizer = tf.train.adam(learningRate);
        this.model.compile({
            optimizer: optimizer,
            loss: "categoricalCrossentropy"
        });
    }

    /**
     * Retrieves the current model path.
     * @returns {string} The current model path.
     */
    getCurrentModelPath() {
        return this.currentModelPath;
    }

    /**
     * Makes a prediction using the trained model.
     * @param {tf.Tensor} x Input tensor for prediction.
     * @returns {Object} Prediction result.
     */
    getPrediction(x) {
        let embeddings = x;
        if (x.shape[1] === 224) {
            embeddings = this.decapitatedMobileNet.predict(x);
        }

        const { values, indices } = this.model.predict(embeddings).topk();
        return {
            label: this.labels[indices.dataSync()[0]],
            confidence: values.dataSync()[0]
        };
    }

    /**
     * Loads a previously saved model.
     * @param {string} dirPath Directory path where the model is saved.
     */
    async loadModel(dirPath) {
        this.model = await tf.loadLayersModel(`file://${dirPath}/model.json`);
        this.labels = await fs.readJson(path.join(dirPath, "labels.json"))
            .then(obj => obj.Labels);

        this.currentModelPath = dirPath;
    }

    /**
     * Saves the current model.
     * @param {string} dirPath Directory path to save the model.
     */
    async saveModel(dirPath) {
        await fs.ensureDir(dirPath);
        await this.model.save(`file://${dirPath}`);
        await fs.writeJson(path.join(dirPath, "labels.json"), { Labels: this.labels });

        this.currentModelPath = dirPath;
    }

    /**
     * Trains the classifier using provided dataset and labels.
     * @param {Object} dataset Dataset containing images and labels.
     * @param {Array<string>} labels Array of class labels.
     * @param {Object} trainingParams Training parameters.
     */
    async train(dataset, labels, trainingParams) {
        if (!dataset || !dataset.images) {
            throw new Error("Bruh, Add some examples before training!");
        }

        this.labels = labels.slice(0);
        this.buildRetrainingModel(
            trainingParams.denseUnits,
            labels.length,
            trainingParams.learningRate
        );

        const batchSize = Math.floor(dataset.images.shape[0] * trainingParams.batchSizeFraction);
        if (!(batchSize > 0)) {
            throw new Error(`Please choose a non-zero fraction. Batch size is 0 or NaN.`);
        }

        const shuffledIndices = new Int32Array(tf.util.createShuffledIndices(dataset.labels.shape[0]));

        console.time("Training Time");
        return this.model.fit(
            dataset.images.gather(shuffledIndices),
            dataset.labels.gather(shuffledIndices),
            {
                batchSize,
                epochs: trainingParams.epochs,
                validationSplit: 0.15,
                callbacks: {
                    onBatchEnd: async (batch, logs) => {
                        trainingParams.trainStatus(`Ooof Loss: ${logs.loss.toFixed(5)}`);
                    },
                    onTrainEnd: async logs => {
                        console.timeEnd("Time of Training: ");
                    }
                }
            }
        );
    }
}
