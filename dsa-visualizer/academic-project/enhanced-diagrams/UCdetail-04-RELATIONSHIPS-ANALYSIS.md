# UCdetail-04: Assessment Testing Module - UML Relationships Analysis

## 📊 Overview
**Module:** Assessment Testing  
**Focus:** Đánh giá kiến thức và kỹ năng lập trình thuật toán  
**Primary Actor:** Student  
**Secondary Actors:** Assessment Engine, Grading System  

---

## 🎯 Actors và Use Cases

### Primary Actors:
- **Student:** Sinh viên làm bài kiểm tra và đánh giá

### Secondary Actors:
- **Assessment Engine:** Hệ thống tạo và chấm bài
- **Grading System:** Hệ thống tính điểm và báo cáo

### Identified Use Cases:
1. **Take Algorithm Quiz** (xanh lá - chính)
2. **Solve Coding Problems** (xanh lá - chính)  
3. **Take Timed Assessment** (xanh lá - chính)
4. **View Assessment Results** (cam - kết quả)
5. **Review Mistakes** (cam - phân tích)
6. **Get Multiple Choice Questions** (xanh dương - loại câu hỏi)
7. **Code Completion Tasks** (xanh dương - loại bài tập)
8. **Algorithm Tracing** (xanh dương - kỹ năng)
9. **Performance Analysis Tasks** (tím - nâng cao)
10. **Track Test Scores** (vàng - theo dõi)
11. **Generate Progress Report** (hồng - báo cáo)
12. **Retake Assessment** (hồng - làm lại)

---

## ⚠️ VẤN ĐỀ HIỆN TẠI TRONG FILE

### ✅ Có Relationships Cơ Bản:
- File có 2 include và 1 extend relationships
- Actor associations cơ bản có

### 🔍 Current Relationships Analysis:
- **include1**: `take-quiz` → `track-scores` ✅ (hợp lý)  
- **include2**: `solve-coding-problems` → `generate-report` ✅ (hợp lý)
- **extend1**: `retake-assessment` → `timed-assessments` ❌ (logic ngược!)

### ❌ Thiếu Relationships Quan Trọng:
- Không có relationships cho question types (multiple choice, code completion, tracing)
- Thiếu flow từ assessment → view results → review mistakes
- Thiếu connections với external actors

---

## 🔧 ĐỀ XUẤT LOGIC RELATIONSHIPS ĐÚNG

### 1. Include Relationships (<<include>>) - BẮT BUỘC:

#### **Take Quiz → Multiple Choice Questions**
```
Source: take-quiz
Target: multiple-choice
Relationship: <<include>>
Logic: Làm quiz BẮT BUỘC có câu hỏi multiple choice
Reasoning: Quiz luôn bao gồm các câu hỏi trắc nghiệm
```

#### **Solve Coding Problems → Code Completion Tasks**
```
Source: solve-coding-problems
Target: code-completion
Relationship: <<include>>
Logic: Giải coding problems BẮT BUỘC có code completion
Reasoning: Coding problems bao gồm hoàn thiện code
```

#### **Take Timed Assessment → Track Test Scores**
```
Source: timed-assessment
Target: track-scores
Relationship: <<include>>
Logic: Thi có thời gian BẮT BUỘC theo dõi điểm số
Reasoning: Timed assessment cần scoring system
```

#### **View Assessment Results → Review Mistakes**
```
Source: view-results
Target: review-mistakes
Relationship: <<include>>
Logic: Xem kết quả BẮT BUỘC có review lỗi sai
Reasoning: Results luôn bao gồm mistake analysis
```

### 2. Extend Relationships (<<extend>>) - TÙY CHỌN:

#### **Algorithm Tracing → Take Quiz**
```
Source: algorithm-tracing
Target: take-quiz
Relationship: <<extend>>
Logic: Algorithm tracing CÓ THỂ được thêm vào quiz
Reasoning: Advanced skill assessment là optional
```

#### **Performance Analysis → Solve Coding Problems**
```
Source: performance-analysis
Target: solve-coding-problems
Relationship: <<extend>>
Logic: Performance analysis CÓ THỂ mở rộng coding problems
Reasoning: Phân tích performance là level nâng cao
```

#### **Retake Assessment → View Assessment Results**
```
Source: retake-assessment
Target: view-results
Relationship: <<extend>>
Logic: Làm lại bài thi CÓ THỂ được thêm sau khi xem kết quả
Reasoning: Retake là option sau khi thất bại
```

#### **Generate Progress Report → Track Test Scores**
```
Source: generate-report
Target: track-scores
Relationship: <<extend>>
Logic: Tạo báo cáo CÓ THỂ mở rộng từ tracking scores
Reasoning: Report generation là enhanced feature
```

### 3. Actor Associations - CẦN HOÀN THIỆN:

#### Current Connections:
- **Student → Take Quiz** ✅
- **Student → Solve Coding Problems** ✅
- **Assessment Engine → Timed Assessment** ✅

#### Cần Thêm:
- **Student → View Assessment Results** ❌
- **Student → Retake Assessment** ❌
- **Assessment Engine → Multiple Choice Questions** ❌
- **Grading System → Track Test Scores** ❌
- **Grading System → Generate Progress Report** ❌

---

## 📝 HƯỚNG DẪN CHỈNH SỬA

### Bước 1: Sửa Current Relationships
```xml
<!-- GIỮ NGUYÊN: include1 và include2 đã đúng -->
<mxCell id="include1" value="&lt;&lt;include&gt;&gt;" source="take-quiz" target="track-scores">
<mxCell id="include2" value="&lt;&lt;include&gt;&gt;" source="solve-coding-problems" target="generate-report">

<!-- SỬA: extend1 - đổi logic -->
OLD: retake-assessment → timed-assessments  
NEW: retake-assessment → view-results
```

### Bước 2: Thêm Include Relationships Mới
```xml
<!-- THÊM: Quiz → Multiple Choice -->
<mxCell id="include3" value="&lt;&lt;include&gt;&gt;" source="take-quiz" target="multiple-choice">

<!-- THÊM: Coding → Code Completion -->
<mxCell id="include4" value="&lt;&lt;include&gt;&gt;" source="solve-coding-problems" target="code-completion">

<!-- THÊM: Timed → Track Scores -->
<mxCell id="include5" value="&lt;&lt;include&gt;&gt;" source="timed-assessment" target="track-scores">

<!-- THÊM: Results → Review Mistakes -->
<mxCell id="include6" value="&lt;&lt;include&gt;&gt;" source="view-results" target="review-mistakes">
```

### Bước 3: Thêm Extend Relationships Mới
```xml
<!-- THÊM: Algorithm Tracing → Quiz -->
<mxCell id="extend2" value="&lt;&lt;extend&gt;&gt;" source="algorithm-tracing" target="take-quiz">

<!-- THÊM: Performance Analysis → Coding -->
<mxCell id="extend3" value="&lt;&lt;extend&gt;&gt;" source="performance-analysis" target="solve-coding-problems">

<!-- THÊM: Generate Report → Track Scores -->
<mxCell id="extend4" value="&lt;&lt;extend&gt;&gt;" source="generate-report" target="track-scores">
```

### Bước 4: Thêm Actor Associations
```xml
<!-- THÊM: Student Connections -->
<mxCell id="student-results" value="" style="endArrow=none" source="student" target="view-results">
<mxCell id="student-retake" value="" style="endArrow=none" source="student" target="retake-assessment">

<!-- THÊM: Assessment Engine Connections -->
<mxCell id="engine-multiple" value="" style="endArrow=none" source="assessment-engine" target="multiple-choice">

<!-- THÊM: Grading System Connections -->
<mxCell id="grading-scores" value="" style="endArrow=none" source="grading-system" target="track-scores">
<mxCell id="grading-report" value="" style="endArrow=none" source="grading-system" target="generate-report">
```

---

## 🎯 Expected Assessment Flow

### Basic Assessment Path:
1. **Student** → **Take Quiz** → (include) → **Multiple Choice Questions**
2. **Take Quiz** → (include) → **Track Test Scores**
3. **Student** → **View Assessment Results** → (include) → **Review Mistakes**

### Coding Assessment Path:
1. **Student** → **Solve Coding Problems** → (include) → **Code Completion Tasks**
2. **Solve Coding Problems** → (include) → **Generate Progress Report**

### Timed Assessment Path:
1. **Student** → **Take Timed Assessment** → (include) → **Track Test Scores**
2. **Assessment Engine** supports the timed assessment process

### Advanced Features:
- **Algorithm Tracing** → (extend) → **Take Quiz**
- **Performance Analysis** → (extend) → **Solve Coding Problems**
- **Generate Report** → (extend) → **Track Test Scores**

### Retry Mechanism:
- **Retake Assessment** → (extend) → **View Assessment Results**

---

## ⚡ TÓM TẮT ACTIONS CẦN THỰC HIỆN

### ✅ Giữ Nguyên:
- **2 include relationships** hiện tại đã đúng logic

### ❌ Cần Sửa/Thêm:
1. **Sửa 1 extend relationship** (logic ngược)
2. **Thêm 4 include relationships** cho question types và results flow
3. **Thêm 3 extend relationships** cho advanced features  
4. **Thêm 5 actor associations** cho complete coverage

**Kết quả:** 6 include + 4 extend + 8 actor associations = Assessment system hoàn chỉnh

---

**Status:** ⚠️ Cần bổ sung đáng kể  
**Priority:** CAO - Assessment là core function  
**Complexity:** Trung bình - cần thêm 12 elements mới
