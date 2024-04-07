import fs from 'fs-extra';
import { ImageData } from './imageData';
import { ImageClassifierModel } from './model';
import { imageDir, savedModelDir } from './constants';

const imageData = new ImageData();
const imageClassifierModel = new ImageClassifierModel();

const trainingParams = {
    batchSizeFraction: 0.2,
    denseUnits: 100,
    epochs: 100,
    learningRate: 0.0001,
    trainStatus: () => {}
};

/**
 * Trains the image classifier model.
 */
export const trainModel = async () => {
    console.log('Cleaning up directories...');
    await fs.remove(savedModelDir);

    console.log('Loading images...');
    await imageData.loadImages(imageDir);

    console.log('Initializing model...');
    await imageClassifierModel.initialize();
    await imageData.prepareTrainingData(imageClassifierModel.decapitatedMobileNet);

    console.log('Training the model...');
    const labels = imageData.getLabels();
    const trainingResult = await imageClassifierModel.train(imageData.dataset, labels, trainingParams);

    console.log('Training completed!');
    const finalLoss = trainingResult.history.loss[trainingResult.history.loss.length - 1];
    console.log(`Final Loss: ${finalLoss.toFixed(5)}`);

    console.log('Model Summary:');
    console.log(imageClassifierModel.model.summary());

    await imageClassifierModel.saveModel(savedModelDir);
};

trainModel();
