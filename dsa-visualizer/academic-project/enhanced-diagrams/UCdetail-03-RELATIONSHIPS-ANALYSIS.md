# UCdetail-03: Visualization Practice Module - UML Relationships Analysis

## 📊 Overview
**Module:** Visualization Practice  
**Focus:** Thực hành và tương tác với visualization thuật toán  
**Primary Actor:** Student  
**Secondary Actors:** Visualization Engine, Animation Controller  

---

## 🎯 Actors và Use Cases

### Primary Actors:
- **Student:** Sinh viên thực hành với visualization

### Secondary Actors:
- **Visualization Engine:** Engine xử lý visualization
- **Animation Controller:** Điều khiển animation

### Identified Use Cases:
1. **Start Algorithm Visualization** (xanh lá - chính)
2. **Input Custom Data Set** (xanh lá - chính)
3. **Control Animation Speed** (xanh lá - chính)
4. **Step Through Algorithm** (cam - điều khiển)
5. **Pause/Resume Execution** (cam - điều khiển)
6. **Modify Algorithm Parameters** (xanh dương - tương tác)
7. **Highlight Current Operations** (xanh dương - tương tác)
8. **View Data Structure State Info** (xanh dương - tương tác)
9. **Compare Multiple Executions** (tím - nâng cao)
10. **Enter Practice Mode** (vàng - chế độ)
11. **Save Practice Session** (hồng - lưu trữ)

---

## ⚠️ VẤN ĐỀ HIỆN TẠI TRONG FILE

### ✅ Có Relationships Cơ Bản:
- File có 3 include và 2 extend relationships
- Actor associations cơ bản có

### 🔍 Cần Phân Tích Logic:
- Start Visualization → Modify Parameters (include) - hợp lý?
- Input Data → Highlight Operations (include) - hợp lý?
- Highlight Operations → Practice Mode (include) - hợp lý?
- Compare Executions → Pause/Resume (extend) - hợp lý?
- Save Session → View State Info (extend) - logic ngược?

---

## 🔧 ĐỀ XUẤT LOGIC RELATIONSHIPS ĐÚNG

### 1. Include Relationships (<<include>>) - BẮT BUỘC:

#### **Start Visualization → Input Custom Data**
```
Source: start-visualization
Target: input-data
Relationship: <<include>>
Logic: Bắt đầu visualization BẮT BUỘC nhập dữ liệu
Reasoning: Không thể visualize mà không có data input
```

#### **Input Data → Highlight Operations**
```
Source: input-data
Target: highlight-operations
Relationship: <<include>>
Logic: Nhập dữ liệu BẮT BUỘC highlight các operation
Reasoning: Cần highlight để user theo dõi được thuật toán
```

#### **Step Through Algorithm → View State Info**
```
Source: step-through
Target: view-state-info
Relationship: <<include>>
Logic: Step through BẮT BUỘC hiển thị state info
Reasoning: Mỗi step cần show state để hiểu thuật toán
```

#### **Enter Practice Mode → Control Animation Speed**
```
Source: practice-mode
Target: control-animation
Relationship: <<include>>
Logic: Practice mode BẮT BUỘC có control animation
Reasoning: Practice cần điều khiển tốc độ để học hiệu quả
```

### 2. Extend Relationships (<<extend>>) - TÙY CHỌN:

#### **Modify Parameters → Start Visualization**
```
Source: modify-parameters
Target: start-visualization
Relationship: <<extend>>
Logic: Modify parameters CÓ THỂ mở rộng start visualization
Reasoning: Advanced users có thể tùy chỉnh parameters
```

#### **Save Session → Practice Mode**
```
Source: save-session
Target: practice-mode
Relationship: <<extend>>
Logic: Save session CÓ THỂ được thêm vào practice mode
Reasoning: Lưu session là tính năng optional
```

#### **Compare Executions → View State Info**
```
Source: compare-executions
Target: view-state-info
Relationship: <<extend>>
Logic: So sánh CÓ THỂ mở rộng việc xem state info
Reasoning: Advanced feature để so sánh multiple runs
```

#### **Pause/Resume → Step Through Algorithm**
```
Source: pause-resume
Target: step-through
Relationship: <<extend>>
Logic: Pause/Resume CÓ THỂ được thêm vào step through
Reasoning: Control playback là enhancement của stepping
```

### 3. Actor Associations - ĐÁNH GIÁ:

#### Current Connections:
- **Student → Start Visualization** ✅
- **Student → Input Data** ✅  
- **Student → Practice Mode** ✅
- **Visualization Engine → Step Through** ✅
- **Animation Controller → View State Info** ✅

#### Cần Thêm:
- **Student → Control Animation Speed** ❌
- **Visualization Engine → Highlight Operations** ❌
- **Animation Controller → Compare Executions** ❌

---

## 📝 HƯỚNG DẪN CHỈNH SỬA

### Bước 1: Sửa Current Relationships (có thể sai logic)
```xml
<!-- KIỂM TRA: include1 hiện tại -->
Current: start-visualization → modify-parameters
Suggest: start-visualization → input-data

<!-- KIỂM TRA: include2 hiện tại -->  
Current: input-data → highlight-operations ✅ (có thể đúng)

<!-- KIỂM TRA: include3 hiện tại -->
Current: highlight-operations → practice-mode
Suggest: practice-mode → control-animation
```

### Bước 2: Sửa Extend Relationships
```xml
<!-- KIỂM TRA: extend1 hiện tại -->
Current: compare-executions → pause-resume
Suggest: modify-parameters → start-visualization

<!-- KIỂM TRA: extend2 hiện tại -->
Current: save-session → view-state-info  
Suggest: save-session → practice-mode
```

### Bước 3: Thêm Missing Relationships
```xml
<!-- THÊM: Step Through Include State Info -->
<mxCell id="include-new" value="&lt;&lt;include&gt;&gt;" source="step-through" target="view-state-info">

<!-- THÊM: Compare Extend State Info -->
<mxCell id="extend-new1" value="&lt;&lt;extend&gt;&gt;" source="compare-executions" target="view-state-info">

<!-- THÊM: Pause Extend Step Through -->
<mxCell id="extend-new2" value="&lt;&lt;extend&gt;&gt;" source="pause-resume" target="step-through">
```

### Bước 4: Thêm Actor Associations
```xml
<!-- THÊM: Student → Control Animation -->
<mxCell id="student-control" value="" style="endArrow=none" source="student" target="control-animation">

<!-- THÊM: Engine → Highlight -->
<mxCell id="engine-highlight" value="" style="endArrow=none" source="visualization-engine" target="highlight-operations">

<!-- THÊM: Controller → Compare -->
<mxCell id="controller-compare" value="" style="endArrow=none" source="animation-controller" target="compare-executions">
```

---

## 🎯 Expected Workflow

### Basic Visualization Flow:
1. **Student** → **Start Visualization** → (include) → **Input Data**
2. **Input Data** → (include) → **Highlight Operations**
3. **Student** can **Control Animation Speed**

### Practice Flow:
1. **Student** → **Enter Practice Mode** → (include) → **Control Animation**
2. Optional: **Save Session** → (extend) → **Practice Mode**

### Advanced Flow:
1. **Step Through Algorithm** → (include) → **View State Info**
2. Optional: **Compare Executions** → (extend) → **View State Info**
3. Optional: **Pause/Resume** → (extend) → **Step Through**

### Customization:
- **Modify Parameters** → (extend) → **Start Visualization**

---

## ⚡ TÓM TẮT ACTIONS CẦN THỰC HIỆN

### ❌ Cần Sửa Hoàn Toàn:
1. **Đánh giá lại 5 relationships hiện tại** - có thể sai logic
2. **Thêm 3-4 relationships mới** cho workflow đúng
3. **Thêm 3 actor associations** còn thiếu

### 🎯 Target Kết Quả:
- **4 include relationships** (mandatory flows)
- **4 extend relationships** (optional enhancements)  
- **8 actor associations** (complete connections)

**Complexity:** CAO - cần review và rebuild nhiều relationships

---

**Status:** ❌ Cần sửa chữa đáng kể  
**Priority:** CAO - Module visualization quan trọng  
**Effort Required:** 2-3 tiếng để analyze và rebuild đúng
