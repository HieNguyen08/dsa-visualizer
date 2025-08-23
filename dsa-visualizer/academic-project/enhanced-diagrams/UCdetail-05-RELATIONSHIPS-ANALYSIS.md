# UCdetail-05: Progress Tracking Module - UML Relationships Analysis

## 📊 Overview
**Module:** Progress Tracking  
**Focus:** Student learning progress monitoring, analytics, and goal tracking  
**Primary Actor:** Student  
**Secondary Actors:** Analytics Engine, Notification System  

---

## 🎯 Actors và Use Cases

### Primary Actors:
- **Student:** Người học chính sử dụng hệ thống theo dõi tiến độ

### Secondary Actors:
- **Analytics Engine:** Hệ thống phân tích dữ liệu học tập
- **Notification System:** Hệ thống thông báo và khuyến nghị

### Primary Use Cases (màu xanh lá):
1. **View Progress Dashboard** - Xem bảng điều khiển tiến độ
2. **Track Learning Time** - Theo dõi thời gian học tập  
3. **Monitor Algorithm Completion** - Giám sát hoàn thành thuật toán

### Secondary Use Cases (màu cam):
4. **View Achievements** - Xem thành tích đạt được
5. **Set Learning Goals** - Đặt mục tiêu học tập

### Support Use Cases (màu xanh dương):
6. **Performance Analytics** - Phân tích hiệu suất
7. **Learning Pattern Analysis** - Phân tích mẫu học tập
8. **Strength/Weakness Identification** - Nhận diện điểm mạnh/yếu

### Utility Use Cases (màu tím):
9. **Generate Progress Reports** - Tạo báo cáo tiến độ

### Core Functions (màu vàng):
10. **Milestone Tracking** - Theo dõi cột mốc
11. **Receive Study Recommendations** - Nhận khuyến nghị học tập
12. **Share Progress with Others** - Chia sẻ tiến độ với người khác

---

## 🔗 UML Relationships Analysis

### 1. Include Relationships (<<include>>)
**Mục đích:** Chức năng bắt buộc phải thực hiện như một phần của use case chính

#### Include 1: View Dashboard → Milestone Tracking
```
Source: View Progress Dashboard
Target: Milestone Tracking
Relationship: <<include>>
Logic: Khi xem dashboard tiến độ, hệ thống BẮT BUỘC phải theo dõi cột mốc
```

#### Include 2: Track Learning Time → Performance Analytics  
```
Source: Track Learning Time
Target: Performance Analytics
Relationship: <<include>>
Logic: Theo dõi thời gian học BẮT BUỘC bao gồm phân tích hiệu suất
```

#### Include 3: View Achievements → Receive Recommendations
```
Source: View Achievements
Target: Receive Study Recommendations  
Relationship: <<include>>
Logic: Xem thành tích BẮT BUỘC kích hoạt hệ thống khuyến nghị
```

### 2. Extend Relationships (<<extend>>)
**Mục đích:** Chức năng tùy chọn có thể được thêm vào

#### Extend 1: Share Progress → Progress Reports
```
Source: Share Progress with Others
Target: Generate Progress Reports
Relationship: <<extend>>
Logic: Chia sẻ tiến độ CÓ THỂ tự động tạo báo cáo chi tiết
```

#### Extend 2: Milestone Tracking → Set Goals
```
Source: Milestone Tracking
Target: Set Learning Goals
Relationship: <<extend>>  
Logic: Theo dõi cột mốc CÓ THỂ dẫn đến việc đặt mục tiêu mới
```

### 3. Actor Associations (solid lines)
**Mục đích:** Kết nối actors với các use cases họ tham gia

#### Student Associations:
- **Student → View Progress Dashboard** (chính)
- **Student → Track Learning Time** (trung tâm)  
- **Student → View Achievements** (phụ)

#### External System Associations:
- **Analytics Engine → Learning Pattern Analysis**
- **Notification System → Receive Study Recommendations**

---

## 🎯 Use Case Flow Analysis

### Primary Flow:
1. **Student** truy cập **View Progress Dashboard**
2. Hệ thống tự động kích hoạt **Milestone Tracking** (include)
3. **Student** có thể **Track Learning Time** 
4. Hệ thống tự động thực hiện **Performance Analytics** (include)
5. **Student** xem **View Achievements**
6. Hệ thống tự động **Receive Study Recommendations** (include)

### Optional Extensions:
- Từ **Share Progress** có thể mở rộng thành **Generate Progress Reports**
- Từ **Milestone Tracking** có thể mở rộng thành **Set Learning Goals**

### External System Interactions:
- **Analytics Engine** xử lý **Learning Pattern Analysis**
- **Notification System** hỗ trợ **Receive Study Recommendations**

---

## 📈 Relationship Semantics

### Include Relationships (Bắt buộc):
✅ **Dependency:** Target use case PHẢI thực hiện khi source use case được kích hoạt  
✅ **Timing:** Thực hiện đồng thời hoặc ngay sau  
✅ **Control:** Source use case điều khiển luồng thực hiện  

### Extend Relationships (Tùy chọn):
✅ **Conditional:** Target use case chỉ thực hiện khi điều kiện được thỏa mãn  
✅ **Enhancement:** Thêm chức năng không bắt buộc  
✅ **Flexibility:** Có thể bỏ qua mà không ảnh hưởng logic chính  

### Actor Associations:
✅ **Participation:** Actor có thể khởi tạo hoặc tham gia use case  
✅ **Communication:** Trao đổi thông tin giữa actor và use case  
✅ **Responsibility:** Actor chịu trách nhiệm về hành động trong use case  

---

## 🎨 Visual Representation

```
[Student] ——————— (View Progress Dashboard)
    |                        |
    |                        | <<include>>
    |                        ↓
    ├————————— (Track Learning Time) ——→ <<include>> ——→ (Performance Analytics)
    |                        
    └————————— (View Achievements) ——→ <<include>> ——→ (Receive Recommendations)
                                                              ↑
                                                              |
                                              [Notification System]

(Share Progress) ——→ <<extend>> ——→ (Generate Reports)

(Milestone Tracking) ——→ <<extend>> ——→ (Set Goals)
        ↑
        | <<include>>
        |
(View Dashboard)


[Analytics Engine] ——————— (Learning Patterns)
```

---

## ✅ Quality Validation

### UML Standards Compliance:
- ✅ Include relationships use dashed arrows with `<<include>>` stereotypes
- ✅ Extend relationships use dashed arrows with `<<extend>>` stereotypes  
- ✅ Actor associations use solid lines without arrows
- ✅ Proper directional flow from base to included/extending use cases

### Semantic Correctness:
- ✅ Include relationships represent mandatory sub-functionality
- ✅ Extend relationships represent optional enhancements
- ✅ Actor associations show proper participation
- ✅ No circular dependencies or logical conflicts

### Academic Standards:
- ✅ Professional UML 2.0 notation
- ✅ Clear stereotype labeling  
- ✅ Appropriate use case granularity
- ✅ Logical flow and dependencies

---

**Status:** ✅ All relationships properly defined and validated  
**Total Relationships:** 5 (3 include + 2 extend)  
**Total Actor Associations:** 5  
**Draw.io Compatibility:** ✅ Confirmed  
**UML Compliance:** ✅ Professional Standard  
