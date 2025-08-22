# Đồ Án Chuyên Ngành - Academic Project Documentation

## Mô tả dự án
Dự án **"Xây dựng Website hỗ trợ đặt chỗ và gợi ý địa điểm du lịch phù hợp"** bao gồm các tài liệu kỹ thuật, diagrams UML và báo cáo hoàn chỉnh được viết bằng LaTeX.

## Cấu trúc thư mục
```
academic-project/
├── diagrams/                  # Các file LaTeX cho diagrams
│   ├── usecase_main.tex      # Use Case Diagram chính
│   ├── class_diagram.tex     # Class Diagram
│   ├── activity_diagram.tex  # Activity Diagram  
│   ├── sequence_diagram.tex  # Sequence Diagram
│   └── system_architecture.tex # System Architecture
├── images/                   # Thư mục chứa hình ảnh
├── academic_report.tex       # File LaTeX chính
├── Makefile                  # Script build automation
└── README.md                # Hướng dẫn này
```

## Yêu cầu hệ thống

### Windows
1. **MiKTeX** hoặc **TeX Live**
   - Tải từ: https://miktex.org/ hoặc https://www.tug.org/texlive/
2. **VS Code** với extension **LaTeX Workshop**

### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install texlive-full
```

### macOS
```bash
brew install --cask mactex
```

## Cách sử dụng

### Với VS Code và LaTeX Workshop

1. **Cài đặt LaTeX Workshop extension**
   ```
   Ctrl+Shift+X → Tìm "LaTeX Workshop" → Install
   ```

2. **Mở workspace**
   ```
   File → Open Folder → Chọn thư mục academic-project
   ```

3. **Compile document**
   - Mở file `academic_report.tex`
   - Nhấn `Ctrl+Alt+B` hoặc click icon ▶️ để build
   - PDF sẽ xuất hiện ở panel bên phải

### Với Makefile (Command Line)

1. **Compile tất cả**
   ```bash
   make all
   ```

2. **Compile từng phần**
   ```bash
   make main        # Chỉ compile document chính
   make diagrams    # Chỉ compile các diagrams
   make usecase     # Compile Use Case Diagram
   make class       # Compile Class Diagram
   make activity    # Compile Activity Diagram
   make sequence    # Compile Sequence Diagram
   make architecture # Compile System Architecture
   ```

3. **Xem file PDF**
   ```bash
   make view        # Compile và mở PDF
   ```

4. **Dọn dẹp**
   ```bash
   make clean       # Xóa file tạm
   make clean-all   # Xóa tất cả file được tạo
   ```

## Các Diagrams UML

### 1. Use Case Diagram
- **File**: `diagrams/usecase_main.tex`
- **Mô tả**: Thể hiện các chức năng chính và mối quan hệ giữa actors
- **Actors**: Khách hàng, Công ty du lịch, Đối tác, Nhân viên

### 2. Class Diagram  
- **File**: `diagrams/class_diagram.tex`
- **Mô tả**: Cấu trúc lớp đối tượng và relationships
- **Classes chính**: User, Tour, Booking, Payment, Services

### 3. Activity Diagram
- **File**: `diagrams/activity_diagram.tex`
- **Mô tả**: Quy trình nghiệp vụ đặt tour du lịch
- **Flow**: Tìm kiếm → Chọn → Đặt chỗ → Thanh toán → Xác nhận

### 4. Sequence Diagram
- **File**: `diagrams/sequence_diagram.tex`
- **Mô tả**: Tương tác giữa các đối tượng theo thời gian
- **Participants**: Customer, UI, Controller, Database, Payment

### 5. System Architecture
- **File**: `diagrams/system_architecture.tex`
- **Mô tả**: Kiến trúc tổng thể hệ thống phân tầng
- **Layers**: Presentation, Business, Data Access, Database

## Tùy chỉnh và Mở rộng

### Thêm Diagram mới
1. Tạo file `.tex` mới trong thư mục `diagrams/`
2. Sử dụng template:
   ```latex
   \documentclass[tikz,border=10pt]{standalone}
   \usepackage[utf8]{inputenc}
   \usepackage[T1]{fontenc}
   \usepackage{tikz}
   
   \begin{document}
   \begin{tikzpicture}
   % Your diagram code here
   \end{tikzpicture}
   \end{document}
   ```
3. Thêm vào `academic_report.tex`:
   ```latex
   \begin{figure}[H]
       \centering
       \input{diagrams/your_new_diagram.tex}
       \caption{Your diagram title}
   \end{figure}
   ```

### Thay đổi Style
- Chỉnh sửa các `tikzset` styles trong mỗi diagram file
- Thay đổi colors, fonts, spacing theo nhu cầu

## Troubleshooting

### Lỗi thường gặp

1. **Package not found**
   ```
   Giải pháp: Cài đặt package thiếu
   - MiKTeX: Sẽ tự động download
   - TeX Live: tlmgr install <package-name>
   ```

2. **Compilation failed**
   ```
   Kiểm tra:
   - Syntax errors trong LaTeX code  
   - Missing \end{} statements
   - Đọc log file để tìm lỗi cụ thể
   ```

3. **Diagrams not showing**
   ```
   Đảm bảo:
   - File .tex trong thư mục diagrams/ tồn tại
   - Đường dẫn \input{} đúng
   - Compile diagrams trước khi compile main
   ```

### Tips for LaTeX

1. **Fonts**: Sử dụng `\usepackage[vietnamese]{babel}` cho tiếng Việt
2. **Tables**: Dùng `longtable` cho tables dài
3. **References**: Sử dụng `\label{}` và `\ref{}` cho cross-references
4. **Bibliography**: Thêm references trong file .bib riêng

## Tài liệu tham khảo

- [LaTeX Documentation](https://www.latex-project.org/help/documentation/)
- [TikZ & PGF Manual](http://mirrors.ctan.org/graphics/pgf/base/doc/pgfmanual.pdf)
- [LaTeX Workshop Extension](https://marketplace.visualstudio.com/items?itemName=James-Yu.latex-workshop)

## Liên hệ

- **Sinh viên**: Nguyễn Minh Hiếu, Bùi Hoàng Quang Huy, Đặng Thành Anh
- **Giảng viên hướng dẫn**: TS. Trương Tuấn Anh
- **Khoa**: Khoa học và Kỹ thuật Máy tính
- **Trường**: Đại học Bách Khoa - ĐHQG TP.HCM
