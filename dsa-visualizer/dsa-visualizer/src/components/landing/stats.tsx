"use client";

import { TrendingUp, Users, BookOpen, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  {
    icon: BookOpen,
    value: "50+",
    label: "Cấu trúc dữ liệu",
    description: "Bộ sưu tập toàn diện các thuật toán"
  },
  {
    icon: TrendingUp,
    value: "15+",
    label: "Danh mục thuật toán",
    description: "Từ khái niệm cơ bản đến nâng cao"
  },
  {
    icon: Users,
    value: "1000+",
    label: "Học sinh đang học",
    description: "Học tập trực quan tương tác"
  },
  {
    icon: Award,
    value: "100%",
    label: "Mã nguồn mở",
    description: "Miễn phí cho tất cả mọi người"
  }
];

export const Stats = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Thống kê nền tảng
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tham gia cùng hàng nghìn sinh viên đang thành thạo cấu trúc dữ liệu thông qua trực quan hóa tương tác
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                    <stat.icon className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-xl font-semibold mb-2">{stat.label}</div>
                <div className="text-muted-foreground">{stat.description}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
