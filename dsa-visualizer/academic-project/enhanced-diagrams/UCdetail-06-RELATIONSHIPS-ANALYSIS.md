# UCdetail-06: User Management Module - UML Relationships Analysis

## 🔐 Overview
**Module:** User Management  
**Focus:** Quản lý tài khoản người dùng và xác thực  
**Primary Actor:** User  
**Secondary Actors:** Authentication Service, Email Service  

---

## 👥 Actors và Use Cases

### Primary Actors:
- **User:** Người dùng hệ thống (sinh viên, giảng viên)

### Secondary Actors:
- **Authentication Service:** Dịch vụ xác thực và phân quyền
- **Email Service:** Dịch vụ gửi email xác thực

### Identified Use Cases:
1. **Register New Account** (xanh lá - chính)
2. **Login to System** (xanh lá - chính)
3. **Logout from System** (xanh lá - chính)
4. **Manage User Profile** (cam - quản lý)
5. **Change Password** (cam - bảo mật)
6. **Validate User Credentials** (xanh dương - xác thực)
7. **Send Email Verification** (xanh dương - xác minh)
8. **Reset Password** (vàng - khôi phục)
9. **Manage User Sessions** (tím - phiên đăng nhập)

---

## ⚠️ VẤN ĐỀ HIỆN TẠI TRONG FILE

### ✅ Có Cấu Trúc Use Cases:
- 9 use cases được định nghĩa rõ ràng
- Color coding theo chức năng

### ❌ Thiếu Hoàn Toàn Relationships:
- **KHÔNG CÓ include relationships nào**
- **KHÔNG CÓ extend relationships nào**  
- **KHÔNG CÓ actor associations nào**

### 🔍 Vấn Đề Logic:
- Use cases độc lập hoàn toàn
- Không thể hiện dependencies giữa authentication flow
- Thiếu connections với external services

---

## 🔧 ĐỀ XUẤT LOGIC RELATIONSHIPS ĐÚNG

### 1. Include Relationships (<<include>>) - BẮT BUỘC:

#### **Register New Account → Send Email Verification**
```
Source: register-account
Target: send-verification
Relationship: <<include>>
Logic: Đăng ký tài khoản BẮT BUỘC gửi email xác thực
Reasoning: Registration process requires email verification
```

#### **Register New Account → Validate User Credentials**
```
Source: register-account
Target: validate-credentials
Relationship: <<include>>
Logic: Đăng ký BẮT BUỘC validate thông tin đầu vào
Reasoning: Must validate input data before account creation
```

#### **Login to System → Validate User Credentials**
```
Source: login
Target: validate-credentials
Relationship: <<include>>
Logic: Đăng nhập BẮT BUỘC validate thông tin xác thực
Reasoning: Login always requires credential validation
```

#### **Login to System → Manage User Sessions**
```
Source: login
Target: manage-sessions
Relationship: <<include>>
Logic: Đăng nhập BẮT BUỘC tạo và quản lý session
Reasoning: Successful login creates user session
```

#### **Change Password → Validate User Credentials**
```
Source: change-password
Target: validate-credentials
Relationship: <<include>>
Logic: Đổi mật khẩu BẮT BUỘC xác thực mật khẩu hiện tại
Reasoning: Must verify current password before changing
```

### 2. Extend Relationships (<<extend>>) - TÙY CHỌN:

#### **Reset Password → Login to System**
```
Source: reset-password
Target: login
Relationship: <<extend>>
Logic: Reset password CÓ THỂ được thêm vào khi login thất bại
Reasoning: Password reset is triggered from failed login attempts
```

#### **Send Email Verification → Reset Password**
```
Source: send-verification
Target: reset-password
Relationship: <<extend>>
Logic: Gửi email verification CÓ THỂ mở rộng cho reset password
Reasoning: Email service can be extended for password reset emails
```

#### **Manage User Profile → Change Password**
```
Source: manage-profile
Target: change-password
Relationship: <<extend>>
Logic: Quản lý profile CÓ THỂ mở rộng để đổi mật khẩu
Reasoning: Password change can be accessed from profile management
```

### 3. Actor Associations - CẦN THÊM HOÀN TOÀN:

#### User Connections:
- **User → Register New Account**
- **User → Login to System**
- **User → Logout from System**
- **User → Manage User Profile**
- **User → Change Password**

#### Authentication Service Connections:
- **Authentication Service → Validate User Credentials**
- **Authentication Service → Manage User Sessions**

#### Email Service Connections:
- **Email Service → Send Email Verification**
- **Email Service → Reset Password**

---

## 📝 HƯỚNG DẪN CHỈNH SỬA

### Bước 1: Thêm Include Relationships
```xml
<!-- THÊM: Register → Email Verification -->
<mxCell id="include1" value="&lt;&lt;include&gt;&gt;" style="dashed=1;endArrow=open;endFill=0" source="register-account" target="send-verification">
    <mxGeometry relative="1" as="geometry"/>
</mxCell>

<!-- THÊM: Register → Validate Credentials -->
<mxCell id="include2" value="&lt;&lt;include&gt;&gt;" style="dashed=1;endArrow=open;endFill=0" source="register-account" target="validate-credentials">
    <mxGeometry relative="1" as="geometry"/>
</mxCell>

<!-- THÊM: Login → Validate Credentials -->
<mxCell id="include3" value="&lt;&lt;include&gt;&gt;" style="dashed=1;endArrow=open;endFill=0" source="login" target="validate-credentials">
    <mxGeometry relative="1" as="geometry"/>
</mxCell>

<!-- THÊM: Login → Manage Sessions -->
<mxCell id="include4" value="&lt;&lt;include&gt;&gt;" style="dashed=1;endArrow=open;endFill=0" source="login" target="manage-sessions">
    <mxGeometry relative="1" as="geometry"/>
</mxCell>

<!-- THÊM: Change Password → Validate Credentials -->
<mxCell id="include5" value="&lt;&lt;include&gt;&gt;" style="dashed=1;endArrow=open;endFill=0" source="change-password" target="validate-credentials">
    <mxGeometry relative="1" as="geometry"/>
</mxCell>
```

### Bước 2: Thêm Extend Relationships
```xml
<!-- THÊM: Reset Password → Login -->
<mxCell id="extend1" value="&lt;&lt;extend&gt;&gt;" style="dashed=1;endArrow=open;endFill=0" source="reset-password" target="login">
    <mxGeometry relative="1" as="geometry"/>
</mxCell>

<!-- THÊM: Email Verification → Reset Password -->
<mxCell id="extend2" value="&lt;&lt;extend&gt;&gt;" style="dashed=1;endArrow=open;endFill=0" source="send-verification" target="reset-password">
    <mxGeometry relative="1" as="geometry"/>
</mxCell>

<!-- THÊM: Manage Profile → Change Password -->
<mxCell id="extend3" value="&lt;&lt;extend&gt;&gt;" style="dashed=1;endArrow=open;endFill=0" source="manage-profile" target="change-password">
    <mxGeometry relative="1" as="geometry"/>
</mxCell>
```

### Bước 3: Thêm Actors (nếu chưa có)
```xml
<!-- THÊM: User Actor -->
<mxCell id="user-actor" value="User" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;fillColor=#e1d5e7;strokeColor=#9673a6" vertex="1" parent="1">
    <mxGeometry x="100" y="200" width="30" height="60" as="geometry"/>
</mxCell>

<!-- THÊM: Authentication Service -->
<mxCell id="auth-service" value="Authentication Service" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;fillColor=#f0f9ff;strokeColor=#1890ff" vertex="1" parent="1">
    <mxGeometry x="600" y="150" width="30" height="60" as="geometry"/>
</mxCell>

<!-- THÊM: Email Service -->
<mxCell id="email-service" value="Email Service" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;fillColor=#fff7e6;strokeColor=#d48806" vertex="1" parent="1">
    <mxGeometry x="600" y="300" width="30" height="60" as="geometry"/>
</mxCell>
```

### Bước 4: Thêm Actor Associations
```xml
<!-- THÊM: User Associations -->
<mxCell id="user-register" value="" style="endArrow=none" source="user-actor" target="register-account">
<mxCell id="user-login" value="" style="endArrow=none" source="user-actor" target="login">
<mxCell id="user-logout" value="" style="endArrow=none" source="user-actor" target="logout">
<mxCell id="user-profile" value="" style="endArrow=none" source="user-actor" target="manage-profile">
<mxCell id="user-password" value="" style="endArrow=none" source="user-actor" target="change-password">

<!-- THÊM: Authentication Service Associations -->
<mxCell id="auth-validate" value="" style="endArrow=none" source="auth-service" target="validate-credentials">
<mxCell id="auth-sessions" value="" style="endArrow=none" source="auth-service" target="manage-sessions">

<!-- THÊM: Email Service Associations -->
<mxCell id="email-verification" value="" style="endArrow=none" source="email-service" target="send-verification">
<mxCell id="email-reset" value="" style="endArrow=none" source="email-service" target="reset-password">
```

---

## 🎯 Expected User Management Flow

### Registration Flow:
1. **User** → **Register New Account** → (include) → **Validate User Credentials**
2. **Register New Account** → (include) → **Send Email Verification**
3. **Email Service** supports email verification process

### Login Flow:
1. **User** → **Login to System** → (include) → **Validate User Credentials**
2. **Login to System** → (include) → **Manage User Sessions**
3. **Authentication Service** handles validation and session management

### Password Management Flow:
1. **User** → **Change Password** → (include) → **Validate User Credentials**
2. **Reset Password** → (extend) → **Login to System** (khi cần thiết)
3. **Manage User Profile** → (extend) → **Change Password** (từ profile)

### Security Features:
- **Authentication Service** provides credential validation and session management
- **Email Service** handles verification and password reset emails
- All authentication flows include mandatory validation steps

---

## ⚡ TÓM TẮT ACTIONS CẦN THỰC HIỆN

### ❌ Cần Thêm Hoàn Toàn:
1. **5 include relationships** cho authentication flows
2. **3 extend relationships** cho optional features
3. **3 actors** (User, Authentication Service, Email Service)
4. **9 actor associations** cho complete connections

**Kết quả:** 5 include + 3 extend + 9 actor associations = User management hoàn chỉnh

---

**Status:** ❌ Thiếu hoàn toàn relationships  
**Priority:** CAO - User management là foundation module  
**Complexity:** Trung bình - cần rebuild relationship structure
