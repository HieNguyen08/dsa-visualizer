# UCdetail-01: Algorithm Selection Module - UML Relationships Analysis

## 📊 Overview
**Module:** Algorithm Selection  
**Focus:** Tìm kiếm, lựa chọn và khám phá thuật toán  
**Primary Actor:** Student  
**Secondary Actors:** Algorithm Database, Recommendation Engine  

---

## 🎯 Actors và Use Cases

### Primary Actors:
- **Student:** Sinh viên tìm kiếm và lựa chọn thuật toán học tập

### Secondary Actors:
- **Algorithm Database:** Cơ sở dữ liệu thuật toán
- **Recommendation Engine:** Hệ thống gợi ý thuật toán

### Identified Use Cases:
1. **Browse Algorithm Categories** (xanh lá - chính)
2. **Search for Specific Algorithm** (xanh lá - chính)
3. **Filter by Difficulty Level** (xanh lá - chính)
4. **View Algorithm Details** (cam - phụ trợ)
5. **Compare Algorithms** (cam - phụ trợ)
6. **Get Algorithm Recommendations** (vàng - hệ thống)
7. **View Prerequisites** (tím - bổ sung)
8. **Bookmark Algorithm** (tím - bổ sung)
9. **Select Algorithm for Learning** (xanh dương - kết quả)

---

## ⚠️ VẤN ĐỀ HIỆN TẠI TRONG FILE

### ❌ Relationships Sai Logic:
1. **include1**: `search-algorithms` → `get-recommendations` có label "extend" nhưng dùng logic "include"
2. **include2**: `search-algorithms` → `view-algorithm-details` có label "extend" nhưng dùng logic "include"
3. **extend1**: `bookmark-algorithm` → `view-algorithm-details` - đúng là extend
4. **extend2**: `view-prerequisites` → `compare-algorithms` - đúng là extend

### ❌ Thiếu Relationships Quan Trọng:
- `browse-categories` không có relationships
- `filter-by-difficulty` không có relationships
- `select-algorithm` không có relationships

---

## 🔧 ĐỀ XUẤT SỬA CHỮA

### 1. Include Relationships (<<include>>) - BẮT BUỘC:

#### **Browse Categories → Get Recommendations**
```
Source: browse-categories
Target: get-recommendations
Relationship: <<include>>
Logic: Duyệt danh mục BẮT BUỘC hiển thị gợi ý
```

#### **Search Algorithms → View Algorithm Details**
```
Source: search-algorithms  
Target: view-algorithm-details
Relationship: <<include>>
Logic: Tìm kiếm BẮT BUỘC hiển thị chi tiết kết quả
```

#### **Filter by Difficulty → Compare Algorithms**
```
Source: filter-by-difficulty
Target: compare-algorithms  
Relationship: <<include>>
Logic: Lọc theo độ khó BẮT BUỘC so sánh các lựa chọn
```

### 2. Extend Relationships (<<extend>>) - TÙY CHỌN:

#### **Bookmark Algorithm → View Algorithm Details**
```
Source: bookmark-algorithm
Target: view-algorithm-details
Relationship: <<extend>>
Logic: Bookmark CÓ THỂ được thêm khi xem chi tiết
```

#### **View Prerequisites → Compare Algorithms**
```
Source: view-prerequisites
Target: compare-algorithms
Relationship: <<extend>>
Logic: Xem điều kiện tiên quyết CÓ THỂ dẫn đến so sánh
```

#### **Get Recommendations → Select Algorithm**
```
Source: get-recommendations
Target: select-algorithm
Relationship: <<extend>>
Logic: Nhận gợi ý CÓ THỂ dẫn đến lựa chọn cuối cùng
```

### 3. Actor Associations - CẦN THÊM:

#### Student Connections:
- **Student → Browse Categories** ✅ (đã có)
- **Student → Search Algorithms** ✅ (đã có)
- **Student → Filter by Difficulty** ❌ (cần thêm)
- **Student → Select Algorithm** ✅ (đã có)

#### External System Connections:
- **Algorithm Database → Search Algorithms** ❌ (cần thêm)
- **Recommendation Engine → Get Recommendations** ❌ (cần thêm)

---

## 📝 HƯỚNG DẪN CHỈNH SỬA

### Bước 1: Sửa Labels Sai
```xml
<!-- SỬA: include1 từ "extend" thành "include" -->
<mxCell id="include1" value="&lt;&lt;include&gt;&gt;" ... source="search-algorithms" target="view-algorithm-details">

<!-- SỬA: include2 - xóa vì logic sai -->
<!-- Thay thế bằng relationship mới -->
```

### Bước 2: Thêm Include Relationships Mới
```xml
<!-- THÊM: Browse → Recommendations -->
<mxCell id="include-new1" value="&lt;&lt;include&gt;&gt;" source="browse-categories" target="get-recommendations">

<!-- THÊM: Filter → Compare -->  
<mxCell id="include-new2" value="&lt;&lt;include&gt;&gt;" source="filter-by-difficulty" target="compare-algorithms">
```

### Bước 3: Thêm Extend Relationship
```xml
<!-- THÊM: Recommendations → Select -->
<mxCell id="extend-new" value="&lt;&lt;extend&gt;&gt;" source="get-recommendations" target="select-algorithm">
```

### Bước 4: Thêm Actor Associations
```xml
<!-- THÊM: Student → Filter -->
<mxCell id="student-filter" value="" style="endArrow=none" source="student" target="filter-by-difficulty">

<!-- THÊM: Database → Search -->
<mxCell id="db-search" value="" style="endArrow=none" source="algorithm-db" target="search-algorithms">

<!-- THÊM: Engine → Recommendations -->
<mxCell id="engine-rec" value="" style="endArrow=none" source="recommendation-engine" target="get-recommendations">
```

---

## 🎯 Logic Workflow Mong Muốn

### Primary Flow:
1. **Student** → **Browse Categories** → (include) → **Get Recommendations**
2. **Student** → **Search Algorithms** → (include) → **View Algorithm Details**  
3. **Student** → **Filter by Difficulty** → (include) → **Compare Algorithms**
4. **Student** chọn cuối cùng → **Select Algorithm**

### Optional Extensions:
- Từ **View Details** có thể **Bookmark** (extend)
- Từ **Compare** có thể **View Prerequisites** (extend) 
- Từ **Get Recommendations** có thể **Select Algorithm** (extend)

### External Support:
- **Algorithm Database** hỗ trợ **Search**
- **Recommendation Engine** cung cấp **Recommendations**

---

## ⚡ TÓM TẮT ACTIONS CẦN THỰC HIỆN

1. **Sửa 2 relationships sai label** (extend → include)
2. **Thêm 3 include relationships mới** 
3. **Thêm 1 extend relationship mới**
4. **Thêm 3 actor associations mới**
5. **Kiểm tra coordinates và geometry** cho layout đẹp

**Kết quả:** 4 include + 3 extend + 6 actor associations = Hoàn chỉnh UML chuẩn

---

**Status:** ❌ Cần sửa chữa toàn bộ  
**Priority:** CAO - Module quan trọng nhất  
**Complexity:** Trung bình - 5 relationships cần sửa/thêm
