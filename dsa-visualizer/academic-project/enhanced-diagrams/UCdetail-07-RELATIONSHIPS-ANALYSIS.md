# UCdetail-07: Collaboration Social Module - UML Relationships Analysis

## 🤝 Overview
**Module:** Collaboration & Social Features  
**Focus:** Tương tác xã hội và học tập nhóm  
**Primary Actors:** Student, Instructor  
**Secondary Actors:** Notification Service, Chat Service  

---

## 👥 Actors và Use Cases

### Primary Actors:
- **Student:** Sinh viên tham gia hoạt động nhóm
- **Instructor:** Giảng viên hướng dẫn và điều hành

### Secondary Actors:
- **Notification Service:** Dịch vụ thông báo
- **Chat Service:** Dịch vụ chat và video conference

### Identified Use Cases:
1. **Create Discussion Forum** (cam - quản lý)
2. **Participate in Discussion** (xanh lá - chính)
3. **Share Algorithm Solution** (xanh lá - chia sẻ)
4. **Conduct Peer Review** (tím - đánh giá)
5. **Create Study Group** (cam - nhóm)
6. **Moderate Discussion Content** (xanh dương - kiểm duyệt)
7. **Rate Solution Quality** (xanh dương - đánh giá)
8. **Send Social Notifications** (vàng - thông báo)
9. **Track User Engagement** (tím - theo dõi)
10. **Real-time Chat** (đỏ - giao tiếp)
11. **Collaborative Code Editing** (đỏ - cộng tác)
12. **Video Conference Integration** (đỏ - hội họp)

---

## ⚠️ VẤN ĐỀ HIỆN TẠI TRONG FILE

### ✅ Có Cấu Trúc Use Cases:
- 12 use cases được phân loại theo màu sắc
- Đầy đủ các tính năng social và collaboration

### ❌ Thiếu Hoàn Toàn Relationships:
- **KHÔNG CÓ include relationships nào**
- **KHÔNG CÓ extend relationships nào**  
- **KHÔNG CÓ actor associations nào**

### 🔍 Vấn Đề Logic:
- Các tính năng collaboration không có mối liên hệ
- Thiếu flow từ discussion → notification → engagement
- Không thể hiện dependencies giữa social features

---

## 🔧 ĐỀ XUẤT LOGIC RELATIONSHIPS ĐÚNG

### 1. Include Relationships (<<include>>) - BẮT BUỘC:

#### **Create Discussion Forum → Send Social Notifications**
```
Source: create-discussion
Target: send-notifications
Relationship: <<include>>
Logic: Tạo forum BẮT BUỘC gửi thông báo cho members
Reasoning: Creating discussion must notify relevant users
```

#### **Participate in Discussion → Track User Engagement**
```
Source: participate-discussion
Target: track-engagement
Relationship: <<include>>
Logic: Tham gia discussion BẮT BUỘC theo dõi engagement
Reasoning: All participation activities must be tracked
```

#### **Share Algorithm Solution → Rate Solution Quality**
```
Source: share-solution
Target: rate-solution
Relationship: <<include>>
Logic: Chia sẻ solution BẮT BUỘC có hệ thống đánh giá
Reasoning: Shared solutions need quality rating system
```

#### **Create Study Group → Send Social Notifications**
```
Source: create-study-group
Target: send-notifications
Relationship: <<include>>
Logic: Tạo study group BẮT BUỘC thông báo thành viên
Reasoning: Group creation requires member notification
```

#### **Conduct Peer Review → Rate Solution Quality**
```
Source: peer-review
Target: rate-solution
Relationship: <<include>>
Logic: Peer review BẮT BUỘC có rating quality
Reasoning: Review process includes quality assessment
```

### 2. Extend Relationships (<<extend>>) - TÙY CHỌN:

#### **Real-time Chat → Participate in Discussion**
```
Source: real-time-chat
Target: participate-discussion
Relationship: <<extend>>
Logic: Real-time chat CÓ THỂ được thêm vào discussion
Reasoning: Chat is optional enhancement for discussions
```

#### **Collaborative Code Editing → Share Algorithm Solution**
```
Source: code-collaboration
Target: share-solution
Relationship: <<extend>>
Logic: Collaborative editing CÓ THỂ mở rộng solution sharing
Reasoning: Advanced collaboration feature for solution development
```

#### **Video Conference Integration → Create Study Group**
```
Source: video-conference
Target: create-study-group
Relationship: <<extend>>
Logic: Video conference CÓ THỂ được thêm vào study groups
Reasoning: Video meetings enhance study group activities
```

#### **Moderate Discussion Content → Participate in Discussion**
```
Source: moderate-content
Target: participate-discussion
Relationship: <<extend>>
Logic: Content moderation CÓ THỂ được kích hoạt trong discussion
Reasoning: Moderation is triggered when needed in discussions
```

### 3. Actor Associations - CẦN THÊM HOÀN TOÀN:

#### Student Connections:
- **Student → Participate in Discussion**
- **Student → Share Algorithm Solution**
- **Student → Conduct Peer Review**
- **Student → Real-time Chat**
- **Student → Collaborative Code Editing**

#### Instructor Connections:
- **Instructor → Create Discussion Forum**
- **Instructor → Create Study Group**
- **Instructor → Moderate Discussion Content**
- **Instructor → Video Conference Integration**

#### Notification Service Connections:
- **Notification Service → Send Social Notifications**
- **Notification Service → Track User Engagement**

#### Chat Service Connections:
- **Chat Service → Real-time Chat**
- **Chat Service → Video Conference Integration**

---

## 📝 HƯỚNG DẪN CHỈNH SỬA

### Bước 1: Thêm Include Relationships
```xml
<!-- THÊM: Create Discussion → Notifications -->
<mxCell id="include1" value="&lt;&lt;include&gt;&gt;" style="dashed=1;endArrow=open;endFill=0" source="create-discussion" target="send-notifications">
    <mxGeometry relative="1" as="geometry"/>
</mxCell>

<!-- THÊM: Participate → Track Engagement -->
<mxCell id="include2" value="&lt;&lt;include&gt;&gt;" style="dashed=1;endArrow=open;endFill=0" source="participate-discussion" target="track-engagement">
    <mxGeometry relative="1" as="geometry"/>
</mxCell>

<!-- THÊM: Share Solution → Rate Quality -->
<mxCell id="include3" value="&lt;&lt;include&gt;&gt;" style="dashed=1;endArrow=open;endFill=0" source="share-solution" target="rate-solution">
    <mxGeometry relative="1" as="geometry"/>
</mxCell>

<!-- THÊM: Create Study Group → Notifications -->
<mxCell id="include4" value="&lt;&lt;include&gt;&gt;" style="dashed=1;endArrow=open;endFill=0" source="create-study-group" target="send-notifications">
    <mxGeometry relative="1" as="geometry"/>
</mxCell>

<!-- THÊM: Peer Review → Rate Quality -->
<mxCell id="include5" value="&lt;&lt;include&gt;&gt;" style="dashed=1;endArrow=open;endFill=0" source="peer-review" target="rate-solution">
    <mxGeometry relative="1" as="geometry"/>
</mxCell>
```

### Bước 2: Thêm Extend Relationships
```xml
<!-- THÊM: Real-time Chat → Discussion -->
<mxCell id="extend1" value="&lt;&lt;extend&gt;&gt;" style="dashed=1;endArrow=open;endFill=0" source="real-time-chat" target="participate-discussion">
    <mxGeometry relative="1" as="geometry"/>
</mxCell>

<!-- THÊM: Code Collaboration → Share Solution -->
<mxCell id="extend2" value="&lt;&lt;extend&gt;&gt;" style="dashed=1;endArrow=open;endFill=0" source="code-collaboration" target="share-solution">
    <mxGeometry relative="1" as="geometry"/>
</mxCell>

<!-- THÊM: Video Conference → Study Group -->
<mxCell id="extend3" value="&lt;&lt;extend&gt;&gt;" style="dashed=1;endArrow=open;endFill=0" source="video-conference" target="create-study-group">
    <mxGeometry relative="1" as="geometry"/>
</mxCell>

<!-- THÊM: Moderate Content → Discussion -->
<mxCell id="extend4" value="&lt;&lt;extend&gt;&gt;" style="dashed=1;endArrow=open;endFill=0" source="moderate-content" target="participate-discussion">
    <mxGeometry relative="1" as="geometry"/>
</mxCell>
```

### Bước 3: Thêm Actors (nếu chưa có)
```xml
<!-- THÊM: Student Actor -->
<mxCell id="student-actor" value="Student" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;fillColor=#d5e8d4;strokeColor=#82b366" vertex="1" parent="1">
    <mxGeometry x="80" y="200" width="30" height="60" as="geometry"/>
</mxCell>

<!-- THÊM: Instructor Actor -->
<mxCell id="instructor-actor" value="Instructor" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;fillColor=#ffe6cc;strokeColor=#d79b00" vertex="1" parent="1">
    <mxGeometry x="80" y="350" width="30" height="60" as="geometry"/>
</mxCell>

<!-- THÊM: Notification Service -->
<mxCell id="notification-service" value="Notification Service" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;fillColor=#fff7e6;strokeColor=#d48806" vertex="1" parent="1">
    <mxGeometry x="650" y="200" width="30" height="60" as="geometry"/>
</mxCell>

<!-- THÊM: Chat Service -->
<mxCell id="chat-service" value="Chat Service" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;fillColor=#fff1f0;strokeColor=#ff4d4f" vertex="1" parent="1">
    <mxGeometry x="650" y="350" width="30" height="60" as="geometry"/>
</mxCell>
```

### Bước 4: Thêm Actor Associations
```xml
<!-- THÊM: Student Associations -->
<mxCell id="student-participate" value="" style="endArrow=none" source="student-actor" target="participate-discussion">
<mxCell id="student-share" value="" style="endArrow=none" source="student-actor" target="share-solution">
<mxCell id="student-review" value="" style="endArrow=none" source="student-actor" target="peer-review">
<mxCell id="student-chat" value="" style="endArrow=none" source="student-actor" target="real-time-chat">
<mxCell id="student-collab" value="" style="endArrow=none" source="student-actor" target="code-collaboration">

<!-- THÊM: Instructor Associations -->
<mxCell id="instructor-create" value="" style="endArrow=none" source="instructor-actor" target="create-discussion">
<mxCell id="instructor-group" value="" style="endArrow=none" source="instructor-actor" target="create-study-group">
<mxCell id="instructor-moderate" value="" style="endArrow=none" source="instructor-actor" target="moderate-content">
<mxCell id="instructor-video" value="" style="endArrow=none" source="instructor-actor" target="video-conference">

<!-- THÊM: Notification Service Associations -->
<mxCell id="notification-send" value="" style="endArrow=none" source="notification-service" target="send-notifications">
<mxCell id="notification-track" value="" style="endArrow=none" source="notification-service" target="track-engagement">

<!-- THÊM: Chat Service Associations -->
<mxCell id="chat-realtime" value="" style="endArrow=none" source="chat-service" target="real-time-chat">
<mxCell id="chat-video" value="" style="endArrow=none" source="chat-service" target="video-conference">
```

---

## 🎯 Expected Collaboration Flow

### Discussion & Forum Flow:
1. **Instructor** → **Create Discussion Forum** → (include) → **Send Social Notifications**
2. **Student** → **Participate in Discussion** → (include) → **Track User Engagement**
3. **Real-time Chat** → (extend) → **Participate in Discussion** (optional enhancement)

### Solution Sharing Flow:
1. **Student** → **Share Algorithm Solution** → (include) → **Rate Solution Quality**
2. **Student** → **Conduct Peer Review** → (include) → **Rate Solution Quality**
3. **Collaborative Code Editing** → (extend) → **Share Algorithm Solution** (advanced feature)

### Study Group Flow:
1. **Instructor** → **Create Study Group** → (include) → **Send Social Notifications**
2. **Video Conference Integration** → (extend) → **Create Study Group** (optional meetings)

### Moderation & Management:
- **Moderate Discussion Content** → (extend) → **Participate in Discussion** (when needed)
- **Notification Service** supports all social interactions
- **Chat Service** provides real-time communication features

---

## ⚡ TÓM TẮT ACTIONS CẦN THỰC HIỆN

### ❌ Cần Thêm Hoàn Toàn:
1. **5 include relationships** cho core social flows
2. **4 extend relationships** cho advanced features
3. **4 actors** (Student, Instructor, Notification Service, Chat Service)
4. **13 actor associations** cho complete social system

**Kết quả:** 5 include + 4 extend + 13 actor associations = Social collaboration hoàn chỉnh

---

**Status:** ❌ Thiếu hoàn toàn relationships  
**Priority:** CAO - Collaboration là tính năng quan trọng  
**Complexity:** Cao - nhiều actors và complex social interactions
