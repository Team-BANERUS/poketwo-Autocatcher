import backgroundremover.utilities as ut
import backgroundremover.bg as bg_module
from backgroundremover.u2net import detection
import numpy as np
import cv2
import torch

# Check if GPU is available
DEVICE = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
# Load the background removal model
bg_model = bg_module.get_model("u2net")

def predict_background(neural_net, input_img):
    """
    Predicts background for the given input image using the specified neural network.

    Args:
        neural_net (torch.nn.Module): Background removal neural network.
        input_img (numpy.ndarray): Input image.

    Returns:
        numpy.ndarray: Predicted background image.
    """
    # Preprocess the input image for inference
    preprocessed_img = detection.preprocess(input_img)
    with torch.no_grad():
        if torch.cuda.is_available():
            # Move input to GPU if available
            input_tensor = torch.cuda.FloatTensor(preprocessed_img["image"].unsqueeze(0).cuda().float())
        else:
            input_tensor = torch.FloatTensor(preprocessed_img["image"].unsqueeze(0).float())
        
        # Perform inference
        out1, out2, out3, out4, out5, out6, out7 = neural_net(input_tensor)
        # Extract the prediction from the network output
        prediction = out1[:, 0, :, :]
        normalized_prediction = detection.norm_pred(prediction)

        normalized_prediction = normalized_prediction.squeeze()
        pred_np = normalized_prediction.cpu().detach().numpy()
        predicted_img = pred_np * 255

        # Cleanup to release memory
        del out1, out2, out3, out4, out5, out6, out7, prediction, normalized_prediction, pred_np, input_tensor, preprocessed_img

        return predicted_img

def remove_background(input_img):
    """
    Removes the background from the given input image.

    Args:
        input_img (numpy.ndarray): Input image.

    Returns:
        numpy.ndarray: Image with background removed.
    """
    # Predict the background mask
    bg_mask = predict_background(bg_model, input_img)
    bg_mask = bg_mask.astype(np.uint8)
    resized_mask = cv2.resize(np.array(bg_mask), (input_img.shape[1], input_img.shape[0]))

    # Apply the mask to the input image
    masked_img = cv2.bitwise_and(input_img, input_img, mask=np.array(resized_mask))
    # Threshold the masked image
    thresholded_img = cv2.threshold(masked_img, 0, 255, cv2.THRESH_BINARY)[1]
    # Convert to grayscale
    grayscale_img = cv2.cvtColor(thresholded_img, cv2.COLOR_BGR2GRAY)

    # Convert to CV_8UC1
    grayscale_img = np.array(grayscale_img, dtype=np.uint8)
    # Find contours in the image
    contours = cv2.findContours(grayscale_img, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)[0]
    extreme_points = np.array([contours[0][0][0], contours[0][0][0], contours[0][0][0], contours[0][0][0]])

    # Find extreme points of the contours
    for cnt in contours:
        cnt = np.squeeze(cnt, axis=1)
        min_x, min_y = np.min(cnt, axis=0)
        max_x, max_y = np.max(cnt, axis=0)
        
        # Update extreme points
        extreme_points[0] = np.minimum(extreme_points[0], [min_x, min_y])
        extreme_points[1] = np.maximum(extreme_points[1], [max_x, max_y])
        extreme_points[2] = np.minimum(extreme_points[2], [min_x, min_y])
        extreme_points[3] = np.maximum(extreme_points[3], [max_x, max_y])
    
    # Crop the image using extreme points
    cropped_img = masked_img[extreme_points[0][1]:extreme_points[1][1], extreme_points[2][0]:extreme_points[3][0]]
    return cropped_img
