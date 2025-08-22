# Makefile for Academic Project LaTeX Documents
# Author: Academic Project Team
# Date: December 2024

# Variables
MAIN_DOC = academic_report
DIAGRAMS_DIR = diagrams
OUTPUT_DIR = output
PDF_DIR = pdf

# LaTeX commands
LATEX = pdflatex
LATEX_FLAGS = -interaction=nonstopmode -halt-on-error

# Diagram files
DIAGRAM_SOURCES = $(wildcard $(DIAGRAMS_DIR)/*.tex)
DIAGRAM_PDFS = $(DIAGRAM_SOURCES:.tex=.pdf)

# Default target
all: setup main diagrams

# Create output directories
setup:
	@echo "Creating output directories..."
	@if not exist $(OUTPUT_DIR) mkdir $(OUTPUT_DIR)
	@if not exist $(PDF_DIR) mkdir $(PDF_DIR)

# Compile main document
main: $(MAIN_DOC).pdf

$(MAIN_DOC).pdf: $(MAIN_DOC).tex $(DIAGRAM_PDFS)
	@echo "Compiling main document..."
	$(LATEX) $(LATEX_FLAGS) $(MAIN_DOC).tex
	$(LATEX) $(LATEX_FLAGS) $(MAIN_DOC).tex
	@move $(MAIN_DOC).pdf $(PDF_DIR)\
	@echo "Main document compiled successfully!"

# Compile all diagrams
diagrams: $(DIAGRAM_PDFS)

# Rule to compile individual diagrams
$(DIAGRAMS_DIR)/%.pdf: $(DIAGRAMS_DIR)/%.tex
	@echo "Compiling diagram: $<"
	cd $(DIAGRAMS_DIR) && $(LATEX) $(LATEX_FLAGS) $(notdir $<)
	@echo "Diagram compiled: $@"

# Individual diagram targets
usecase: $(DIAGRAMS_DIR)/usecase_main.pdf
class: $(DIAGRAMS_DIR)/class_diagram.pdf
activity: $(DIAGRAMS_DIR)/activity_diagram.pdf
sequence: $(DIAGRAMS_DIR)/sequence_diagram.pdf
architecture: $(DIAGRAMS_DIR)/system_architecture.pdf

# Clean temporary files
clean:
	@echo "Cleaning temporary files..."
	@rm -f *.aux *.log *.toc *.out *.nav *.snm *.vrb *.fls *.fdb_latexmk *.synctex.gz
	@rm -f $(DIAGRAMS_DIR)/*.aux $(DIAGRAMS_DIR)/*.log $(DIAGRAMS_DIR)/*.fls $(DIAGRAMS_DIR)/*.fdb_latexmk $(DIAGRAMS_DIR)/*.synctex.gz
	@echo "Cleanup completed!"

# Clean all generated files including PDFs
clean-all: clean
	@echo "Cleaning all generated files..."
	@rm -f $(MAIN_DOC).pdf
	@rm -f $(DIAGRAM_PDFS)
	@rm -rf $(OUTPUT_DIR) $(PDF_DIR)
	@echo "All files cleaned!"

# Install required LaTeX packages (Ubuntu/Debian)
install-deps:
	@echo "Installing LaTeX dependencies..."
	sudo apt-get update
	sudo apt-get install -y texlive-full

# Install required LaTeX packages (Windows with MiKTeX)
install-deps-windows:
	@echo "Please install MiKTeX from https://miktex.org/"
	@echo "Or install TeX Live from https://www.tug.org/texlive/"

# Compile and open main document
view: main
	@echo "Opening main document..."
	@if command -v xdg-open > /dev/null; then \
		xdg-open $(PDF_DIR)/$(MAIN_DOC).pdf; \
	elif command -v open > /dev/null; then \
		open $(PDF_DIR)/$(MAIN_DOC).pdf; \
	elif command -v start > /dev/null; then \
		start $(PDF_DIR)/$(MAIN_DOC).pdf; \
	else \
		echo "Please open $(PDF_DIR)/$(MAIN_DOC).pdf manually"; \
	fi

# Help target
help:
	@echo "Available targets:"
	@echo "  all          - Compile everything (default)"
	@echo "  main         - Compile main document only"
	@echo "  diagrams     - Compile all diagrams"
	@echo "  usecase      - Compile use case diagram"
	@echo "  class        - Compile class diagram"
	@echo "  activity     - Compile activity diagram"
	@echo "  sequence     - Compile sequence diagram"
	@echo "  architecture - Compile system architecture diagram"
	@echo "  clean        - Remove temporary files"
	@echo "  clean-all    - Remove all generated files"
	@echo "  view         - Compile and open main document"
	@echo "  install-deps - Install LaTeX dependencies (Linux)"
	@echo "  help         - Show this help message"

# Phony targets
.PHONY: all setup main diagrams clean clean-all install-deps install-deps-windows view help usecase class activity sequence architecture
