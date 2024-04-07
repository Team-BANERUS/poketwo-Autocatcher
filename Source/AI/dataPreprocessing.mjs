import Jimp from 'jimp';
import fs from 'fs-extra';
import glob from 'glob-promise';
import path from 'path';

import { bulbapediaImageDir, poketwoImageDir, trainingImageDir } from './constants';

/**
 * Augments the brightness of images.
 * @param {Array<Object>} files Array of image files.
 * @param {number} brightnessDelta Delta value for brightness adjustment.
 */
async function augmentBrightness(files, brightnessDelta = 0.4) {
    for (const item of files) {
        const baseDir = path.join(item.parsed.dir, "brightness");
        const baseName = path.join(baseDir, item.parsed.name);

        await fs.ensureDir(baseDir);

        const brighter = await Jimp.read(item.image).brightness(brightnessDelta);
        const darker = await Jimp.read(item.image).brightness(-brightnessDelta);
        /* Reference: 
         https://github.com/Eklavya-11/Aipokedex?tab=readme-ov-file#data-preprocessing-and-augmentation
        For Premium AI Model, several pre-processing methods are incorporated. 
        */
        await Promise.all([
            brighter.writeAsync(baseName + "_b" + item.parsed.ext),
            darker.writeAsync(baseName + "_d" + item.parsed.ext)
        ]);
    }
}

/**
 * Gets directories within the specified directory.
 * @param {string} imagesDirectory Directory path.
 * @returns {Promise<Array<string>>} Array of directory names.
 */
const getDirectories = async (imagesDirectory) => fs.readdir(imagesDirectory);

/**
 * Gets images within a directory.
 * @param {string} directory Directory path.
 * @returns {Promise<Array<string>>} Array of image file paths.
 */
const getImagesInDirectory = async (directory) => glob([
    path.join(directory, "*.png"),
    path.join(directory, "*.jpg")
]);

/**
 * Reads images from directories.
 * @param {string} imagesDirectory Directory path.
 * @returns {Promise<Array<Object>>} Array of objects containing label and image paths.
 */
const readImagesDirectory = async (imagesDirectory) => {
    const directories = await getDirectories(imagesDirectory);
    return Promise.all(
        directories.map(async directory => {
            const p = path.join(imagesDirectory, directory);
            const images = await getImagesInDirectory(p);
            return { label: directory, images };
        })
    );
};

/**
 * Copies images from source directory to destination directory.
 * @param {string} name Directory name.
 * @param {string} source Source directory path.
 * @param {string} destination Destination directory path.
 */
const copyImagesFromDirectory = async (name, source, destination) => {
    const images = await fs.readdir(source);

    for (const image of images) {
        console.log(`Copying image for ${name}: ${image}`);
        await fs.copy(path.join(source, image), path.join(destination, image));
    }
};

/**
 * Copies images to the training directory.
 */
const copyImagesToTrainingDir = async () => {
    const directories = await fs.readdir(bulbapediaImageDir);

    for (const directory of directories) {
        const trainingDir = path.join(trainingImageDir, directory);
        await fs.ensureDir(trainingDir);

        const bulbapediaDir = path.join(bulbapediaImageDir, directory);
        await copyImagesFromDirectory(directory, bulbapediaDir, trainingDir);

        const poketwoDir = path.join(poketwoImageDir, directory);
        if (await fs.pathExists(poketwodDir)) {
            await copyImagesFromDirectory(directory, poketwoDir, trainingDir);
        }
    }
};

/**
 * Runs the data preparation process.
 */
async function runDataPreparation() {
    console.log('Cleaning up training directory...');
    await fs.remove(trainingImageDir);
    await fs.ensureDir(trainingImageDir);
    await copyImagesToTrainingDir();

    console.log('Reading images directory...');
    const images = await readImagesDirectory(trainingImageDir);

    for (const item of images) {
        const files = await Promise.all(
            item.images.map(async name => ({
                image: name,
                parsed: path.parse(name)
            }))
        );

        console.log(`Adjusting brightness for ${item.label}...`);
        await augmentBrightness(files);
    }
}

runDataPreparation();
