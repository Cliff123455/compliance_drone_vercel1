#!/usr/bin/env python
"""
Process Anomaly Images

This script processes thermal and wide images that have anomalies detected, 
adds the Automate Solar logo, and saves them to a dedicated output folder.
"""

import os
import cv2
import numpy as np
from PIL import Image
import argparse
import glob

def has_bounding_box(image_path):
    """
    Check if an image has red bounding boxes indicating anomalies.
    Returns True if red rectangles are detected, False otherwise.
    """
    try:
        # Read the image
        img = cv2.imread(image_path)
        if img is None:
            print(f"Could not read image: {image_path}")
            return False
        
        # Convert to HSV space for easier color detection
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        
        # Define red color range in HSV
        # Red has two ranges in HSV, so we need to check both
        lower_red1 = np.array([0, 120, 70])
        upper_red1 = np.array([10, 255, 255])
        mask1 = cv2.inRange(hsv, lower_red1, upper_red1)
        
        lower_red2 = np.array([170, 120, 70])  
        upper_red2 = np.array([180, 255, 255])
        mask2 = cv2.inRange(hsv, lower_red2, upper_red2)
        
        # Combine masks
        red_mask = cv2.bitwise_or(mask1, mask2)
        
        # To consider an image as having a bounding box, we look for:
        # - Sufficient red pixels in a pattern consistent with a bounding box
        
        # Count red pixels
        red_pixel_count = cv2.countNonZero(red_mask)
        
        # Detect if red pixels form lines (potential bounding boxes)
        # We'll apply morphological operations to identify line segments
        kernel = np.ones((3, 3), np.uint8)
        dilated = cv2.dilate(red_mask, kernel, iterations=1)
        eroded = cv2.erode(dilated, kernel, iterations=1)
        
        # Find contours that could be rectangles
        contours, _ = cv2.findContours(eroded, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Check if any contour could be a bounding box
        for contour in contours:
            # Approximate the contour to a polygon
            perimeter = cv2.arcLength(contour, True)
            approx = cv2.approxPolyDP(contour, 0.04 * perimeter, True)
            
            # If it has 4 points, it could be a rectangle
            if len(approx) == 4:
                return True
        
        # Also check if there's a reasonable number of red pixels that could be a bounding box
        # A typical bounding box may have at least 500 red pixels
        if red_pixel_count > 500:
            return True
            
        return False
    
    except Exception as e:
        print(f"Error checking for bounding boxes in {image_path}: {e}")
        return False

def add_logo_to_image(image_path, logo_path, output_path):
    """
    Add the Automate Solar logo to an image.
    
    Args:
        image_path: Path to the source image
        logo_path: Path to the logo image
        output_path: Path where the image with logo should be saved
    """
    try:
        # Read the source image
        img = cv2.imread(image_path)
        if img is None:
            print(f"Could not read image: {image_path}")
            return False
        
        # Read the logo
        logo = cv2.imread(logo_path, cv2.IMREAD_UNCHANGED)
        if logo is None:
            print(f"Could not read logo: {logo_path}")
            return False
        
        # Make sure logo has an alpha channel
        if logo.shape[2] == 3:  # Convert BGR to BGRA
            b, g, r = cv2.split(logo)
            alpha = np.ones(b.shape, dtype=b.dtype) * 255
            logo = cv2.merge((b, g, r, alpha))
        
        # Calculate logo size (30% of image width)
        img_h, img_w = img.shape[:2]
        logo_aspect_ratio = logo.shape[1] / logo.shape[0]
        logo_width = int(img_w * 0.2)  # Logo width is 20% of image width
        logo_height = int(logo_width / logo_aspect_ratio)
        
        # Resize logo
        logo = cv2.resize(logo, (logo_width, logo_height))
        
        # Define region of interest
        roi_y = img_h - logo_height - 20  # 20 pixels from bottom
        roi_x = 20  # 20 pixels from left
        
        # Get region of interest from source image
        roi = img[roi_y:roi_y + logo_height, roi_x:roi_x + logo_width]
        
        # Create mask from logo alpha channel
        if logo.shape[2] == 4:  # If logo has alpha channel
            logo_alpha = logo[:, :, 3] / 255.0
            alpha_3channel = cv2.merge([logo_alpha, logo_alpha, logo_alpha])
            
            # Extract BGR channels from logo
            logo_bgr = logo[:, :, :3]
            
            # Blend logo with image region
            for c in range(0, 3):
                roi[:, :, c] = roi[:, :, c] * (1 - alpha_3channel[:, :, c]) + \
                               logo_bgr[:, :, c] * alpha_3channel[:, :, c]
            
            # Place the blended region back in the image
            img[roi_y:roi_y + logo_height, roi_x:roi_x + logo_width] = roi
        else:
            # If no alpha channel, just overlay logo
            img[roi_y:roi_y + logo_height, roi_x:roi_x + logo_width] = logo[:, :, :3]
        
        # Save the result
        cv2.imwrite(output_path, img)
        return True
    
    except Exception as e:
        print(f"Error adding logo to {image_path}: {e}")
        return False

def process_images(input_folder, output_folder, logo_path):
    """
    Process all annotated images in the input folder:
    - Check if they have bounding boxes (indicating anomalies)
    - If yes, add the logo and save to output folder
    
    Args:
        input_folder: Folder containing annotated images
        output_folder: Folder where processed images will be saved
        logo_path: Path to the logo file
    """
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    
    # Count variables
    total_images = 0
    anomaly_images = 0
    
    # Get all JPG files in the input folder
    image_patterns = ['*A.JPG', '*A.jpg', '*TA.JPG', '*TA.jpg', '*WA.JPG', '*WA.jpg', '*ZA.JPG', '*ZA.jpg']
    
    for pattern in image_patterns:
        image_files = glob.glob(os.path.join(input_folder, pattern))
        
        for image_path in image_files:
            total_images += 1
            filename = os.path.basename(image_path)
            
            # Skip T.JPG files (thermal) that are not annotated
            if '_T.' in filename or 't.' in filename:
                print(f"Skipping thermal image: {filename}")
                continue
            
            print(f"Processing {filename}...")
            
            # Check if image has bounding boxes (anomalies)
            if has_bounding_box(image_path):
                anomaly_images += 1
                output_path = os.path.join(output_folder, filename)
                
                # Add logo and save
                if add_logo_to_image(image_path, logo_path, output_path):
                    print(f"âœ“ Added logo to {filename} and saved to {output_folder}")
                else:
                    print(f"âœ— Failed to process {filename}")
            else:
                print(f"- No anomalies detected in {filename}, skipping")
    
    print(f"\nSummary:")
    print(f"Total images processed: {total_images}")
    print(f"Images with anomalies: {anomaly_images}")
    print(f"Images saved to: {output_folder}")

def main():
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Process annotated images with anomalies.')
    parser.add_argument('--input', default='Thermal_outputsA', help='Input folder containing annotated images')
    parser.add_argument('--output', default='Processed_Anomaly_Images', help='Output folder for processed images')
    parser.add_argument('--logo', default='Pic_Logo.png', help='Path to logo file')
    
    args = parser.parse_args()
    
    # Check if logo file exists
    if not os.path.exists(args.logo):
        print(f"Error: Logo file not found: {args.logo}")
        return
    
    # Process images
    process_images(args.input, args.output, args.logo)

if __name__ == '__main__':
    main()