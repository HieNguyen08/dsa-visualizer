# DSA Visualizer Academic Report

Báo cáo đồ án chuyên ngành về xây dựng platform học tập thuật toán và cấu trúc dữ liệu tương tác.

## 📁 Cấu trúc Project

```
academic-project/
├── academic_report_complete.tex    # Main LaTeX file
├── refs.bib                       # Bibliography references
├── Makefile-complete              # Build automation
├── chapters/                      # Các chương của báo cáo
│   ├── authenticity-declaration.tex
│   ├── acknowledgement.tex
│   ├── abstract.tex
│   ├── 1-introduction.tex
│   ├── 2-literature-review.tex
│   ├── 3-system-analysis.tex
│   ├── 4-system-design.tex        # (Cần tạo)
│   ├── 5-implementation.tex       # (Cần tạo)
│   ├── 6-testing-evaluation.tex   # (Cần tạo)
│   └── 7-conclusion.tex           # (Cần tạo)
├── images/                        # Hình ảnh và logo
├── diagrams/                      # UML diagrams
├── enhanced-diagrams/             # Enhanced diagrams
└── output/                        # Build output
```

## 🔧 Requirements

### LaTeX Distribution
- **Windows**: MiKTeX hoặc TeX Live
- **macOS**: MacTeX
- **Linux**: TeX Live

### Required Packages
Các packages sau sẽ được cài đặt tự động:
- `biblatex` (IEEE style bibliography)
- `tikz` (Diagrams và graphics)
- `algorithm2e` (Algorithm pseudocode)
- `listings` (Code syntax highlighting)
- `hyperref` (PDF links)
- `geometry` (Page layout)

## 🚀 Build Instructions

### Method 1: Using Makefile (Recommended)

```bash
# Build complete PDF with bibliography
make -f Makefile-complete all

# Quick build (no bibliography)
make -f Makefile-complete quick

# Clean build files
make -f Makefile-complete clean

# Rebuild from scratch
make -f Makefile-complete rebuild

# View generated PDF
make -f Makefile-complete view
```

### Method 2: Manual LaTeX Commands

```bash
# Step 1: Initial LaTeX compilation
pdflatex -output-directory=output academic_report_complete.tex

# Step 2: Bibliography processing
cd output
biber academic_report_complete

# Step 3: Final compilations (2 times)
cd ..
pdflatex -output-directory=output academic_report_complete.tex
pdflatex -output-directory=output academic_report_complete.tex
```

### Method 3: VS Code LaTeX Workshop

1. Install "LaTeX Workshop" extension
2. Open `academic_report_complete.tex`
3. Press `Ctrl+Alt+B` to build
4. Press `Ctrl+Alt+V` to view PDF

## 📝 Customization

### Thông tin sinh viên và giảng viên

Edit trong `academic_report_complete.tex`:

```latex
% Thay đổi thông tin này
\large \textbf{GV HƯỚNG DẪN} & : \large TS. [TÊN GIẢNG VIÊN]\\
\large \textbf{SINH VIÊN}& : \large [TÊN SINH VIÊN 1] - [MSSV 1]\\
                        & :  \large [TÊN SINH VIÊN 2] - [MSSV 2]\\
```

### Thêm hình ảnh

1. Copy hình ảnh vào thư mục `images/`
2. Sử dụng trong LaTeX:

```latex
\begin{figure}[H]
\centering
\includegraphics[width=0.8\textwidth]{images/your-image.png}
\caption{Mô tả hình ảnh}
\label{fig:your-label}
\end{figure}
```

### Thêm references

Edit file `refs.bib`:

```bibtex
@article{your-ref-2024,
  title={Title of your reference},
  author={Author Name},
  journal={Journal Name},
  year={2024},
  publisher={Publisher}
}
```

Cite trong text:
```latex
Theo nghiên cứu của \cite{your-ref-2024}...
```

## 📊 Chapters Status

| Chapter | File | Status | Description |
|---------|------|--------|-------------|
| Tuyên bố | `authenticity-declaration.tex` | ✅ Complete | Tuyên bố tính xác thực |
| Lời cảm ơn | `acknowledgement.tex` | ✅ Complete | Acknowledgements |
| Tóm tắt | `abstract.tex` | ✅ Complete | Abstract (Vi + En) |
| Chương 1 | `1-introduction.tex` | ✅ Complete | Giới thiệu hệ thống |
| Chương 2 | `2-literature-review.tex` | ✅ Complete | Tổng quan nghiên cứu |
| Chương 3 | `3-system-analysis.tex` | ✅ Complete | Phân tích hệ thống |
| Chương 4 | `4-system-design.tex` | ⏳ Pending | Thiết kế hệ thống |
| Chương 5 | `5-implementation.tex` | ⏳ Pending | Hiện thực |
| Chương 6 | `6-testing-evaluation.tex` | ⏳ Pending | Kiểm thử đánh giá |
| Chương 7 | `7-conclusion.tex` | ⏳ Pending | Kết luận |
| Phụ lục | `appendix.tex` | ⏳ Pending | Appendices |

## 🎨 Formatting Guidelines

### Sections
```latex
\chapter{CHAPTER TITLE}           # Chương
\section{Section Title}           # Mục
\subsection{Subsection Title}     # Tiểu mục
\subsubsection{Subsubsection}     # Tiểu mục con
```

### Tables
```latex
\begin{table}[H]
\centering
\caption{Table caption}
\label{tab:table-label}
\begin{tabularx}{\textwidth}{|l|X|}
\hline
\textbf{Header 1} & \textbf{Header 2} \\
\hline
Data 1 & Data 2 \\
\hline
\end{tabularx}
\end{table}
```

### Code Listings
```latex
\begin{lstlisting}[language=JavaScript, caption=Code example]
function bubbleSort(arr) {
    // Implementation here
    return arr;
}
\end{lstlisting}
```

## 🔍 Troubleshooting

### Common Issues

1. **"Package not found" error**
   ```bash
   # Update package database
   tlmgr update --self
   tlmgr update --all
   ```

2. **Bibliography not showing**
   - Ensure `biber` is installed
   - Run full build sequence (not just pdflatex)

3. **Images not displaying**
   - Check image file paths
   - Ensure images are in correct format (PNG, JPG, PDF)

4. **Build errors**
   ```bash
   # Clean and rebuild
   make -f Makefile-complete clean
   make -f Makefile-complete all
   ```

### Get Help

- Check LaTeX log files in `output/` directory
- Search specific error messages online
- Consult LaTeX documentation: https://www.latex-project.org/

## 📋 TODO List

- [ ] Complete Chapter 4: System Design
- [ ] Complete Chapter 5: Implementation  
- [ ] Complete Chapter 6: Testing & Evaluation
- [ ] Complete Chapter 7: Conclusion
- [ ] Add more diagrams and screenshots
- [ ] Review and proofread all content
- [ ] Final formatting và citation check

## 📄 Output

Sau khi build thành công, file PDF sẽ được tạo tại:
```
output/academic_report_complete.pdf
```

Báo cáo được format theo chuẩn HCMUT với:
- Font chữ: Times New Roman 13pt
- Spacing: 1.5 lines
- Margins: Left 35mm, Others 30mm
- Page numbering: Roman (trang đầu), Arabic (nội dung)
- Bibliography: IEEE style
