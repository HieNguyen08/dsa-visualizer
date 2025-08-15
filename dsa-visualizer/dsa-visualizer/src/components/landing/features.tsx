"use client";

import { 
  Play, 
  Eye, 
  Code2, 
  Zap, 
  BookOpen, 
  Palette,
  Brain,
  Clock,
  Target
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Play,
    title: "Hoạt ảnh tương tác",
    description: "Xem các thuật toán sống động với hoạt ảnh mượt mà, từng bước một giúp các khái niệm phức tạp trở nên dễ hiểu.",
    color: "text-green-600"
  },
  {
    icon: Eye,
    title: "Trực quan hóa thời gian thực",
    description: "Xem chính xác cách hoạt động bên trong của cấu trúc dữ liệu với biểu diễn trực quan chi tiết và theo dõi trạng thái.",
    color: "text-blue-600"
  },
  {
    icon: Code2,
    title: "Ví dụ mã nguồn",
    description: "Học với các triển khai mã thực tế cùng với các minh họa trực quan để hiểu rõ hơn.",
    color: "text-purple-600"
  },
  {
    icon: Zap,
    title: "Phân tích hiệu suất",
    description: "Hiểu độ phức tạp thời gian và không gian với các chỉ số hiệu suất tích hợp và công cụ so sánh.",
    color: "text-yellow-600"
  },
  {
    icon: BookOpen,
    title: "Học tập toàn diện",
    description: "Từ mảng cơ bản đến cây nâng cao - bao phủ đầy đủ các cấu trúc dữ liệu và thuật toán cần thiết.",
    color: "text-red-600"
  },
  {
    icon: Palette,
    title: "Giao diện đẹp mắt",
    description: "Thiết kế hiện đại, sạch sẽ với hỗ trợ chế độ tối/sáng cho các phiên học tập thoải mái.",
    color: "text-pink-600"
  },
  {
    icon: Brain,
    title: "Nội dung giáo dục",
    description: "Giải thích sâu sắc, các trường hợp sử dụng và ứng dụng thực tế cho mọi thuật toán và cấu trúc dữ liệu.",
    color: "text-indigo-600"
  },
  {
    icon: Clock,
    title: "Học theo tốc độ riêng",
    description: "Kiểm soát tốc độ hoạt ảnh, tạm dừng, tua lại và khám phá theo tốc độ riêng với các điều khiển trực quan.",
    color: "text-teal-600"
  },
  {
    icon: Target,
    title: "Bài tập thực hành",
    description: "Kiểm tra sự hiểu biết với các bài tập tương tác và thử thách lập trình cho từng chủ đề.",
    color: "text-orange-600"
  }
];

export const Features = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Tại sao chọn nền tảng của chúng tôi?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Trải nghiệm cách toàn diện và tương tác nhất để học cấu trúc dữ liệu và thuật toán
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 group border-l-4 border-l-transparent hover:border-l-primary">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
