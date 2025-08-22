import PyPDF2
import sys

def pdf_to_text(pdf_path, output_path=None):
    """Convert PDF to text file"""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                text += f"\n--- Trang {page_num + 1} ---\n"
                text += page.extract_text()
                text += "\n"
            
            if output_path is None:
                output_path = pdf_path.replace('.pdf', '_extracted.txt')
            
            with open(output_path, 'w', encoding='utf-8') as output_file:
                output_file.write(text)
            
            print(f"Đã convert thành công: {output_path}")
            return text
            
    except Exception as e:
        print(f"Lỗi khi convert PDF: {e}")
        return None

if __name__ == "__main__":
    if len(sys.argv) > 1:
        pdf_path = sys.argv[1]
        pdf_to_text(pdf_path)
    else:
        # Đường dẫn mặc định
        pdf_path = r"d:\Downloads\repository\dsa-visualizer\ĐỒ ÁN.pdf"
        pdf_to_text(pdf_path)
