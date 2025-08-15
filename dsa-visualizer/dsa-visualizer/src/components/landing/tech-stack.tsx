"use client";

import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

const technologies = [
  {
    name: "Next.js",
    description: "Framework React cho sản phẩm",
    logo: "/next.svg",
    category: "Frontend"
  },
  {
    name: "TypeScript",
    description: "JavaScript an toàn kiểu dữ liệu",
    logo: "/next.svg", // Using placeholder
    category: "Ngôn ngữ"
  },
  {
    name: "Tailwind CSS",
    description: "Framework CSS utility-first",
    logo: "/next.svg", // Using placeholder
    category: "Styling"
  },
  {
    name: "Framer Motion",
    description: "Thư viện hoạt ảnh cho React",
    logo: "/next.svg", // Using placeholder
    category: "Hoạt ảnh"
  },
  {
    name: "Lucide Icons",
    description: "Biểu tượng đẹp & nhất quán",
    logo: "/next.svg", // Using placeholder
    category: "Biểu tượng"
  },
  {
    name: "Radix UI",
    description: "Thành phần nguyên thủy có thể truy cập",
    logo: "/next.svg", // Using placeholder
    category: "Thành phần"
  }
];

export const TechStack = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Được xây dựng với công nghệ hiện đại
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Được hỗ trợ bởi các công cụ và framework tiêu chuẩn ngành để có hiệu suất và trải nghiệm người dùng tối ưu
          </p>
        </div>

        {/* Technology Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {technologies.map((tech, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Image
                      src={tech.logo}
                      alt={tech.name}
                      width={24}
                      height={24}
                      className="opacity-70 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                      {tech.name}
                    </h3>
                    <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                      {tech.category}
                    </span>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  {tech.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Key Features */}
        <div className="bg-card rounded-2xl p-8 border">
          <h3 className="text-2xl font-bold text-center mb-8">Tính năng kỹ thuật chính</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h4 className="font-semibold mb-2">Hiệu suất nhanh</h4>
              <p className="text-sm text-muted-foreground">Được tối ưu hóa về tốc độ với thuật toán hiệu quả</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h4 className="font-semibold mb-2">Thiết kế responsive</h4>
              <p className="text-sm text-muted-foreground">Hoạt động hoàn hảo trên tất cả thiết bị</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔧</span>
              </div>
              <h4 className="font-semibold mb-2">An toàn kiểu dữ liệu</h4>
              <p className="text-sm text-muted-foreground">Hỗ trợ TypeScript đầy đủ cho độ tin cậy</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">♿</span>
              </div>
              <h4 className="font-semibold mb-2">Có thể truy cập</h4>
              <p className="text-sm text-muted-foreground">Tuân thủ WCAG cho tất cả người dùng</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
