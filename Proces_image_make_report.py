import os
import sys
import reportlab
from PIL import Image
import pandas as pd
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, legal
from dotenv import load_dotenv
from pypdf import PdfReader, PdfWriter
import json

load_dotenv()
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
reportlab.rl_config.TTFSearchPath.append(os.path.join(BASE_DIR, 'fonts'))

# Default column mappings that can be overridden via environment variables
DEFAULT_COLUMN_MAPPINGS = {
    "location_number": "Location #",
    "incident_id": "Incident_ID",
    "date": "Date",
    "inspection_type": "Inspection Type",
    "finding": "Finding",
    "location": "Location",
    "map_image": "Map",  # Renamed from "Inverter Block" to "Map"
    "area": "Inverter_ID / Area",
    "reference": "Reference Doc",
    "image_columns": ["Thermal_Photo", "Annotated Image", "Wide Photo Name", "Zoom Photo Name"],
    "latitude": "Latitude",
    "longitude": "Longitude"
}


def load_column_mappings():
    """Load column mappings from environment variable or use defaults"""
    custom_mappings = os.environ.get("COLUMN_MAPPINGS", "")
    if custom_mappings:
        try:
            return json.loads(custom_mappings)
        except json.JSONDecodeError:
            print("Error parsing COLUMN_MAPPINGS, using defaults")
    
    # Allow individual column overrides
    mappings = DEFAULT_COLUMN_MAPPINGS.copy()
    for key in mappings:
        env_override = os.environ.get(f"COLUMN_{key.upper()}")
        if env_override:
            mappings[key] = env_override
    
    # Handle image columns specially
    image_columns_str = os.environ.get("IMAGE_COLUMNS", "")
    if image_columns_str:
        mappings["image_columns"] = [x.strip() for x in image_columns_str.split(",") if x.strip()]
        
    return mappings


def create_pdf(output_pdf, pagesize=None):
    """Create a new PDF canvas with the specified page size"""
    if pagesize is None:
        pagesize_name = os.environ.get("PAGE_SIZE", "legal").lower()
        if pagesize_name == "letter":
            pagesize = letter
        else:
            pagesize = legal
    
    return canvas.Canvas(output_pdf, pagesize=pagesize)


def get_spreadsheet(csv_path):
    """Load CSV data with proper encoding"""
    encoding = os.environ.get("CSV_ENCODING", "utf-8")
    return pd.read_csv(csv_path, encoding=encoding)


def start_new_page(pdf):
    """Start a new page in the PDF"""
    pdf.showPage()


def get_page_dimensions():
    """Get page dimensions based on configured page size"""
    pagesize_name = os.environ.get("PAGE_SIZE", "legal").lower()
    if pagesize_name == "letter":
        return letter
    else:
        return legal


def get_page_width():
    """Get page width based on configured page size"""
    width, height = get_page_dimensions()
    return width


def get_page_height():
    """Get page height based on configured page size"""
    width, height = get_page_dimensions()
    return height


def calculate_scaled_image_dimensions(image_path, target_width=None, target_height=None):
    """Calculate scaled dimensions maintaining aspect ratio"""
    with Image.open(image_path) as img:
        w, h = img.size
    
    if target_width and not target_height:
        return target_width, int(target_width * h / w)
    elif target_height and not target_width:
        return int(target_height * w / h), target_height
    elif target_width and target_height:
        return target_width, target_height
    else:
        return w, h


def resize_image(image_path, output_path, target_width=None, target_height=None):
    """Resize image maintaining aspect ratio if only one dimension specified"""
    try:
        img = Image.open(image_path)
        
        if target_width or target_height:
            w, h = img.size
            
            if target_width and not target_height:
                target_height = int(h * target_width / w)
            elif target_height and not target_width:
                target_width = int(w * target_height / h)
                
            img = img.resize((target_width, target_height))
        
        # Determine the output format
        _, ext = os.path.splitext(output_path)
        if ext.lower() in ['.jpg', '.jpeg']:
            img.save(output_path, 'JPEG', quality=95)
        else:
            img.save(output_path, 'PNG')
            
    except Exception as e:
        print(f"Error resizing image {image_path}: {e}")
        # Just copy the file if we can't resize it
        img.save(output_path)


def delete_image(image_path):
    """Delete a temporary image file"""
    if os.path.exists(image_path):
        try:
            os.remove(image_path)
        except Exception as e:
            print(f"Could not delete {image_path}: {e}")
    else:
        print(f"File does not exist: {image_path}")


def get_file_extension(file_path):
    """Get the file extension without the dot"""
    _, file_extension = os.path.splitext(file_path)
    return file_extension[1:] if file_extension else 'png'


def split_list(input_list, size):
    """Split a list into chunks of specified size"""
    return [input_list[i:i + size] for i in range(0, len(input_list), size)]


def add_location_header(pdf, location_number, x, y):
    """Add location number at the top of the images section"""
    if not location_number:
        return
        
    location_font = os.environ.get("LOCATION_FONT", "Helvetica")
    location_font_size = int(os.environ.get("DATA_LOCATION_FONT_SIZE", 12))
    location_label = os.environ.get("LOCATION_LABEL", "Location")
    
    pdf.setFont(location_font, location_font_size)
    pdf.drawString(x, y, f"{location_label}: #{location_number}")


def add_images_to_pdf(pdf, image_list_found, location_number, logo_offset):
    """Add images to the PDF in a grid layout"""
    images_per_row = int(os.environ.get('IMAGES_PER_ROW', 2))
    image_grid_row_height = int(os.environ.get('IMAGE_GRID_ROW_HEIGHT', 200))
    show_location_at_top = os.environ.get('SHOW_LOCATION_AT_TOP', 'true').lower() == 'true'
    
    # Calculate starting Y position based on logo offset
    header_gap = int(os.environ.get('HEADER_IMAGE_GAP', 20))
    image_y_start = logo_offset + header_gap
    image_start_y = get_page_height() - image_y_start
    
    # Add location at top if enabled
    if show_location_at_top and location_number:
        location_font_size = int(os.environ.get("DATA_LOCATION_FONT_SIZE", 12))
        margin_left = int(os.environ.get("IMAGE_MARGIN_LEFT", 30))
        add_location_header(pdf, location_number, margin_left, image_start_y + location_font_size)
        image_start_y -= location_font_size * 1.5  # Add space after location header
    
    # Skip if no images found
    if not image_list_found:
        return image_start_y, int(os.environ.get("IMAGE_MARGIN_LEFT", 30))
    
    # Split images into rows
    rows = split_list(image_list_found, images_per_row)
    image_grid_row_width = int(os.environ.get('IMAGE_GRID_ROW_WIDTH', -1))  # -1 means auto-size
    left_margin = int(os.environ.get("IMAGE_MARGIN_LEFT", 30))
    
    for row_idx, row in enumerate(rows):
        # Calculate widths for this row
        image_widths = []
        for image in row:
            if image_grid_row_width == -1:
                width, _ = calculate_scaled_image_dimensions(image, target_height=image_grid_row_height)
            else:
                width = image_grid_row_width
            image_widths.append(width)
        
        # Calculate spacing between images
        page_width = get_page_width()
        total_image_width = sum(image_widths)
        available_space = page_width - 2 * left_margin
        
        if len(row) > 1:
            # Calculate equal spacing between images
            spacing = (available_space - total_image_width) / (len(row) - 1)
            spacing = max(spacing, 10)  # Ensure minimum spacing
        else:
            spacing = 0
        
        # Center the row if only one image
        if len(row) == 1:
            start_x = (page_width - image_widths[0]) / 2
        else:
            start_x = left_margin
        
        # Draw each image in the row
        for img_idx, image in enumerate(row):
            width = image_widths[img_idx]
            image_tmp = f"{image}.tmp.{get_file_extension(image)}"
            
            # Resize the image
            resize_image(image, image_tmp, target_width=width, target_height=image_grid_row_height)
            
            # Calculate position
            y = image_start_y - image_grid_row_height
            x = start_x
            
            print(f"Drawing image {img_idx+1} in row {row_idx+1} at ({x}, {y})")
            
            try:
                pdf.drawImage(image_tmp, x, y, width=width, height=image_grid_row_height)
            except Exception as e:
                print(f"Error adding image {image} to PDF: {e}")
                
            delete_image(image_tmp)
            start_x += width + spacing
        
        # Update Y position for next row
        image_start_y -= image_grid_row_height + int(os.environ.get("IMAGE_ROW_GAP", 15))

    # Return position for data section to start
    return image_start_y, left_margin


def wrap_text(text, font_name, font_size, max_width):
    """Wrap text to fit within max_width"""
    words = text.split()
    lines = []
    current_line = []
    
    for word in words:
        test_line = ' '.join(current_line + [word])
        width = pdfmetrics.stringWidth(test_line, font_name, font_size)
        
        if width <= max_width:
            current_line.append(word)
        else:
            if current_line:
                lines.append(' '.join(current_line))
                current_line = [word]
            else:
                # Word is too long for the line, force it
                lines.append(word)
                current_line = []
    
    if current_line:
        lines.append(' '.join(current_line))
    
    return lines


def get_report_keys():
    """Get the list of fields to include in the report"""
    # Default keys
    default_keys = ['Incident_ID', 'Inspection Type', 'Finding', 'Location',
                   'Inverter_ID / Area', 'Reference Doc', 'Longitude', 'Latitude']
    
    # Allow override via environment variable
    custom_keys = os.environ.get("REPORT_FIELDS", "")
    if custom_keys:
        return [k.strip() for k in custom_keys.split(",") if k.strip()]
    return default_keys


def add_data_to_pdf(pdf, row, column_mappings, offset):
    """Add data fields to the PDF with improved formatting"""
    y, left_margin = offset
    data_font = os.environ.get("DATA_FONT", "Helvetica")
    data_font_bold = data_font
    data_font_size = int(os.environ.get("DATA_FONT_SIZE", 11))
    
    # Add a gap after images
    y -= int(os.environ.get("DATA_TOP_MARGIN", 20))
    
    pdf.setFont(data_font, data_font_size)
    
    # Get report keys from environment or defaults
    report_keys = get_report_keys()
    
    # Calculate column widths
    page_width = get_page_width()
    label_width = page_width * 0.2  # 20% for labels
    value_width = page_width * 0.7  # 70% for values
    right_margin = page_width * 0.1  # 10% for right margin
    
    # Create data table
    for key in report_keys:
        # Skip this field if it doesn't exist in the data
        if key not in row:
            print(f"Warning: Field '{key}' not found in row data, skipping")
            continue
            
        value = row[key]
        
        # Skip empty values if configured to do so
        if pd.isna(value) and os.environ.get("SKIP_EMPTY_FIELDS", "true").lower() == "true":
            continue
            
        x = left_margin
        
        # Get custom label for this field if defined
        field_label = os.environ.get(f"LABEL_{key.upper().replace(' ', '_')}", key)
        
        # Draw field label
        pdf.setFont(data_font, data_font_size)
        pdf.drawString(x, y, f"{field_label}:")
        
        # Draw field value
        pdf.setFont(data_font, data_font_size)
        
        # Handle multi-line values for "Finding" field
        if key == "Finding" and len(str(value)) > 70:
            lines = wrap_text(str(value), data_font, data_font_size, value_width)
            for i, line in enumerate(lines):
                if i == 0:
                    pdf.drawString(x + label_width, y, line)
                else:
                    y -= data_font_size * 1.2
                    pdf.drawString(x + label_width, y, line)
        else:
            pdf.drawString(x + label_width, y, f"{value}")
        
        y -= data_font_size * 1.5  # Spacing between fields
        
    y -= data_font_size  # Extra space after fields

    return y


def add_map_to_pdf(pdf, map_image, offset):
    """Add a map image to the bottom of the PDF with improved sizing"""
    if not map_image or not os.path.exists(map_image):
        print(f"Map image not found: {map_image}")
        return
    
    # Calculate dimensions
    width, height = get_page_dimensions()
    
    # Use more space for the map (adjust as needed)
    map_height = min(offset * 0.9, height * 0.4)  # Use 90% of remaining space or 40% of page height
    
    # Calculate width while maintaining aspect ratio
    with Image.open(map_image) as img:
        img_width, img_height = img.size
        map_width = map_height * img_width / img_height
    
    # Ensure map isn't too wide
    if map_width > width * 0.9:
        map_width = width * 0.9
        map_height = map_width * img_height / img_width
    
    # Center horizontally
    start_x = (width - map_width) / 2
    start_y = (offset - map_height) / 2  # Center in available space
    
    try:
        # Create temp resized version
        map_tmp = f"{map_image}.tmp.{get_file_extension(map_image)}"
        resize_image(map_image, map_tmp, target_width=map_width, target_height=map_height)
        
        pdf.drawImage(map_tmp, start_x, start_y, width=map_width, height=map_height)
        delete_image(map_tmp)
    except Exception as e:
        print(f"Error adding map image to PDF: {e}")


def save_pdf(pdf):
    """Save the PDF document"""
    pdf.save()


def find_map_image(map_name, image_dir):
    """Find a map image file based on name"""
    if not map_name:
        return None
        
    # Look for exact match first
    map_name = str(map_name).strip()
    
    # Simple directory check
    direct_path = os.path.join(image_dir, map_name)
    if os.path.exists(direct_path):
        return direct_path
        
    # Check common image extensions
    for ext in ['png', 'jpg', 'jpeg', 'gif']:
        path = os.path.join(image_dir, f"{map_name}.{ext}")
        if os.path.exists(path):
            return path
            
    # Try finding a file containing the map name
    files = recursive_file_list(image_dir)
    map_file = next((f for f in files if map_name.lower() in os.path.basename(f).lower()), None)
    
    return map_file


def recursive_file_list(image_dir):
    """Get a list of all files in a directory and its subdirectories"""
    if not os.path.exists(image_dir):
        print(f"Directory does not exist: {image_dir}")
        return []
        
    return [os.path.join(root, file) for root, dirs, files in os.walk(image_dir) for file in files]


def add_logo_to_pdf(pdf, logo, client_logo):
    """Add logos and header text to the PDF"""
    width, height = get_page_dimensions()
    
    # Logo dimensions
    logo_width = int(os.environ.get("LOGO_WIDTH", 106))
    logo_height = int(os.environ.get("LOGO_HEIGHT", 24))
    logo_margin = int(os.environ.get("LOGO_MARGIN", 30))

    # Client logo on left
    client_logo_y = height - 35
    client_logo_x = logo_margin
    
    print(f"Printing client_logo at ({client_logo_x},{client_logo_y}) - {logo_width}, {logo_height}")
    pdf.drawImage(client_logo, client_logo_x, client_logo_y, width=logo_width, height=logo_height)

    # Company logo on right
    logo_x = width - logo_width - logo_margin
    logo_y = height - 35
    
    print(f"Printing logo at ({logo_x},{logo_y}) - {logo_width}, {logo_height}")
    pdf.drawImage(logo, logo_x, logo_y, width=logo_width, height=logo_height)
    
    # Header text
    header_font = os.environ.get("HEADER_FONT", "Calibrib")
    header_font_size = int(os.environ.get("HEADER_FONT_SIZE", 16))
    pdf.setFont(header_font, header_font_size)
    
    text = os.environ.get('HEADER_TEXT', 'Automate Solar')
    text2 = os.environ.get('SUBHEADER_TEXT', '')

    # Center header text
    text_width = pdfmetrics.stringWidth(text, header_font, header_font_size)
    new_x = (width - text_width) / 2
    
    text_width2 = pdfmetrics.stringWidth(text2, header_font, header_font_size)
    new_x2 = (width - text_width2) / 2

    text_height_start = height - 25
    print(f"Printing header at ({new_x},{text_height_start}) - {text_width}")
    pdf.drawString(new_x, text_height_start, text)
    
    if text2:
        subheader_y = text_height_start - header_font_size + 0.1 * header_font_size
        print(f"Printing sub header at ({new_x2},{subheader_y}) - {text_width2}")
        pdf.drawString(new_x2, subheader_y, text2)
        return get_page_height() - subheader_y
    
    return get_page_height() - text_height_start


def process_spreadsheet_row(row, pdf, logo, client_logo, base_image_dir, column_mappings):
    """Process a single row from the spreadsheet"""
    # Load mappings for key fields
    incident_id_col = column_mappings.get("incident_id", "Incident_ID")
    location_col = column_mappings.get("location_number", "Location #")
    map_col = column_mappings.get("map_image", "Map")
    image_cols = column_mappings.get("image_columns", [])
    
    # Extract key values
    incident_id = row.get(incident_id_col, "Unknown")
    location_num = row.get(location_col, "")

    print(f"Processing Incident ID: {incident_id}")
    
    # Check if base image directory exists
    if not os.path.exists(base_image_dir):
        print(f"Base image directory not found: {base_image_dir}")
        return
        
    # Custom image directory path pattern from environment
    image_dir_pattern = os.environ.get("IMAGE_DIR_PATTERN", "{base_dir}")
    image_dir = image_dir_pattern.format(
        base_dir=base_image_dir,
        incident_id=incident_id,
        location=location_num
    )
    
    print(f"Image Directory: {image_dir}")
    
    # Add logos and header
    logo_offset = add_logo_to_pdf(pdf, logo, client_logo)
    
    # Process images
    image_offset = (0, 0)  # Default if no images
    
    if image_cols:
        # Get image filenames from row
        image_list = []
        for col in image_cols:
            if col in row and row[col]:
                image_list.append(str(row[col]))
                
        if image_list:
            image_offset = process_images(image_dir, image_list, pdf, row, logo_offset, location_num)
        else:
            print("No images specified in row")
    else:
        print("No image columns configured, skipping images")

    # Add data fields
    text_offset = add_data_to_pdf(pdf, row, column_mappings, image_offset)
    
    # Add map if specified
    if map_col in row and row[map_col]:
        map_name = row[map_col]
        map_image = find_map_image(map_name, base_image_dir)
        
        if map_image:
            add_map_to_pdf(pdf, map_image, text_offset)
        else:
            print(f"âš ï¸ Map image not found for '{map_name}'")


def process_images(image_dir, image_list, pdf, row, logo_offset, location_number):
    """Find and add images to the PDF"""
    if not os.path.exists(image_dir):
        print(f"Image directory not found: {image_dir}")
        return (0, 0)
        
    all_images = recursive_file_list(image_dir)
    image_list_found = []
    
    for image_name in image_list:
        if not image_name or pd.isna(image_name):
            continue
            
        # Normalize the image name
        image_name = str(image_name).strip()
        
        # Try direct path first
        direct_path = os.path.join(image_dir, image_name)
        if os.path.exists(direct_path):
            image_list_found.append(direct_path)
            continue
            
        # Try with common extensions
        for ext in ['png', 'jpg', 'jpeg', 'gif']:
            path = os.path.join(image_dir, f"{image_name}.{ext}")
            if os.path.exists(path):
                image_list_found.append(path)
                break
        else:
            # Search for partial matches in all images
            image_file = next((img for img in all_images if image_name.lower() in os.path.basename(img).lower()), None)
            
            if image_file:
                image_list_found.append(image_file)
            else:
                print(f"Could not find image: {image_name}")
    
    if image_list_found:
        return add_images_to_pdf(pdf, image_list_found, location_number, logo_offset)
    else:
        return (0, 0)


def process_spreadsheet(csv, pdf, logo_path, client_logo_path, base_image_dir):
    """Process all rows in the spreadsheet"""
    logo = ImageReader(logo_path)
    client_logo = ImageReader(client_logo_path)
    column_mappings = load_column_mappings()
    
    # Process each row
    for index, row in csv.iterrows():
        print(f"Processing row {index+1}/{len(csv)}")
        process_spreadsheet_row(row.to_dict(), pdf, logo, client_logo, base_image_dir, column_mappings)
        start_new_page(pdf)


def compress_pdf(input_pdf, output_pdf):
    """Compress the PDF to reduce file size"""
    print("Compressing PDF...")
    
    try:
        writer = PdfWriter(clone_from=input_pdf)
        page_count = len(writer.pages)
        
        for i, page in enumerate(writer.pages, 1):
            print(f"Compressing page {i}/{page_count}")
            page.compress_content_streams()
            
            # Compress images if available
            for j, img in enumerate(page.images, 1):
                print(f"Compressing image {j} on page {i}")
                try:
                    quality = int(os.environ.get("IMAGE_COMPRESSION_QUALITY", 80))
                    img.replace(img.image, quality=quality)
                except Exception as e:
                    print(f"Error compressing image: {e}")
        
        with open(output_pdf, "wb") as f:
            writer.write(f)
            
        return True
    except Exception as e:
        print(f"Error compressing PDF: {e}")
        return False


def main():
    # Parse command line arguments
    if len(sys.argv) < 3:
        print("Usage: python main.py data.csv output.pdf")
        sys.exit(-1)
        
    input_csv = sys.argv[1]
    final_output_pdf = sys.argv[2]
    temp_output_pdf = f"{final_output_pdf}.tmp.pdf"
    
    # Load paths from environment variables
    logo_path = os.environ.get("COMPANY_LOGO", "../Pic_Logo.png")
    client_logo_path = os.environ.get("CLIENT_LOGO", "../Pic_Logo.png")
    base_image_dir = os.environ.get("IMAGE_FOLDER", "./Images")
    
    # Validate required files exist
    if not os.path.exists(base_image_dir):
        print(f"Error: Image folder not found: {base_image_dir}")
        sys.exit(-1)
        
    if not os.path.exists(client_logo_path):
        print(f"Error: Client logo not found: {client_logo_path}")
        sys.exit(-1)
        
    if not os.path.exists(logo_path):
        print(f"Error: Company logo not found: {logo_path}")
        sys.exit(-1)
        
    if not os.path.exists(input_csv):
        print(f"Error: CSV file not found: {input_csv}")
        sys.exit(-1)
    
    # Register fonts
    try:
        header_font = os.environ.get("HEADER_FONT", "Calibrib")
        data_font = os.environ.get("DATA_FONT", "Helvetica")
        
        # Try to register fonts
        fonts_registered = False
        
        try:
            # Try TTF extension
            pdfmetrics.registerFont(TTFont(header_font, f'{header_font}.ttf'))
            pdfmetrics.registerFont(TTFont(data_font, f'{data_font}.ttf'))
            # pdfmetrics.registerFont(TTFont(f"{data_font} Bold", f'{data_font}b.ttf'))
            fonts_registered = True
        except Exception as e1:
            print(f"Failed to register fonts with .ttf extension: {e1}")
            
            try:
                # Try with .TTF extension
                pdfmetrics.registerFont(TTFont(header_font, f'{header_font}.TTF'))
                pdfmetrics.registerFont(TTFont(data_font, f'{data_font}.TTF'))
                # pdfmetrics.registerFont(TTFont(f"{data_font} Bold", f'{data_font}b.TTF'))
                fonts_registered = True
            except Exception as e2:
                print(f"Failed to register fonts with .TTF extension: {e2}")
        
        if not fonts_registered:
            print("Warning: Using default fonts")
            
        print("Registered fonts:", pdfmetrics.getRegisteredFontNames())
    except Exception as e:
        print(f"Warning: Could not register fonts: {e}")
        print("Using default fonts")

    # Create the PDF
    pdf = create_pdf(temp_output_pdf)
    
    # Load and process the CSV
    try:
        csv = get_spreadsheet(input_csv)
        process_spreadsheet(csv, pdf, logo_path, client_logo_path, base_image_dir)
        save_pdf(pdf)
        
        # Compress the PDF if enabled
        if os.environ.get("COMPRESS_PDF", "true").lower() == "true":
            if compress_pdf(temp_output_pdf, final_output_pdf):
                # Delete temp file if compression succeeded
                if os.path.exists(temp_output_pdf):
                    os.remove(temp_output_pdf)
            else:
                # Use uncompressed version if compression failed
                import shutil
                shutil.copy(temp_output_pdf, final_output_pdf)
                if os.path.exists(temp_output_pdf):
                    os.remove(temp_output_pdf)
        else:
            # Just rename temp file to final if no compression
            import shutil
            shutil.copy(temp_output_pdf, final_output_pdf)
            if os.path.exists(temp_output_pdf):
                os.remove(temp_output_pdf)
            
        print(f"PDF successfully created: {final_output_pdf}")
    except Exception as e:
        print(f"Error processing CSV: {e}")
        sys.exit(-1)


if __name__ == '__main__':
    main()