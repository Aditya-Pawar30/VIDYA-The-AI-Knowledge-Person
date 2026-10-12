import os
import fitz  # PyMuPDF

def render_pdf_to_images(pdf_path: str, output_dir: str = "data/rendered_pages", dpi: int = 150) -> list[dict]:
    """
    Renders each page of a PDF into an image file.

    Args:
        pdf_path: Path to the input PDF file.
        output_dir: Directory to save the rendered images.
        dpi: Resolution for the rendered images (default 150 for a balance of quality and size).

    Returns:
        A list of dictionaries containing metadata for each rendered page.
    """
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF file not found: {pdf_path}")

    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)
    
    # Extract base filename without extension to organize outputs if needed
    base_name = os.path.splitext(os.path.basename(pdf_path))[0]

    metadata = []
    
    try:
        doc = fitz.open(pdf_path)
    except Exception as e:
        raise Exception(f"Failed to open PDF {pdf_path}: {e}")

    # Process each page
    for page_num in range(len(doc)):
        page = doc[page_num]
        
        # Calculate scaling factor based on desired DPI (default PyMuPDF is 72 DPI)
        zoom = dpi / 72.0
        mat = fitz.Matrix(zoom, zoom)
        
        try:
            pix = page.get_pixmap(matrix=mat)
            
            # Using 1-based indexing for page numbers in filenames and metadata
            human_page_num = page_num + 1
            image_filename = f"{base_name}_page_{human_page_num}.png"
            image_path = os.path.join(output_dir, image_filename)
            
            # Save the image
            pix.save(image_path)
            
            metadata.append({
                "page_number": human_page_num,
                "image_path": image_path,
                "source_pdf": pdf_path
            })
        except Exception as e:
            print(f"Warning: Failed to render page {human_page_num} of {pdf_path}: {e}")
            
    doc.close()
    return metadata

if __name__ == "__main__":
    # Simple test using the existing sample PDF
    test_pdf = "data/sample.pdf"
    print(f"Testing PDF rendering on: {test_pdf}")
    try:
        results = render_pdf_to_images(test_pdf)
        print("\nRendering successful! Metadata:")
        for res in results:
            print(f"  Page {res['page_number']} -> {res['image_path']}")
    except Exception as e:
        print(f"Error during testing: {e}")
