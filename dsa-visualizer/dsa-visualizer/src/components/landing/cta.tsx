"use client";

import { MoveRight, Github, BookOpen, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export const CTA = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-primary/5 via-purple-500/5 to-pink-500/5">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto bg-gradient-to-br from-primary/10 to-purple-500/10 border-2">
          <CardContent className="p-12 text-center">
            <div className="mb-8">
              <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Sẵn sàng thành thạo cấu trúc dữ liệu?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Tham gia cùng hàng nghìn sinh viên đã và đang học thông qua trực quan hóa tương tác. 
                Bắt đầu hành trình của bạn ngay hôm nay với nền tảng toàn diện của chúng tôi.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <Link href="/visualizer" className="w-full sm:w-auto">
                <RainbowButton className="w-full sm:w-auto text-lg px-8 py-4">
                  <Play className="w-5 h-5 mr-2" />
                  Bắt đầu học ngay
                  <MoveRight className="w-5 h-5 ml-2" />
                </RainbowButton>
              </Link>
              
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-4 bg-background/80 hover:bg-background">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Duyệt thuật toán
                </Button>
              </Link>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">50+</div>
                <div className="text-sm text-muted-foreground">Thuật toán & Cấu trúc dữ liệu</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">15+</div>
                <div className="text-sm text-muted-foreground">Danh mục tương tác</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">100%</div>
                <div className="text-sm text-muted-foreground">Miễn phí & Mã nguồn mở</div>
              </div>
            </div>

            <div className="border-t pt-8">
              <p className="text-muted-foreground mb-4">
                Muốn đóng góp hoặc khám phá mã nguồn?
              </p>
              <Link href="https://github.com/yourusername/dsa-visualizer">
                <Button variant="ghost" className="gap-2">
                  <Github className="w-4 h-4" />
                  Xem trên GitHub
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Additional features highlight */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
          <Card className="text-center hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold mb-2">Học tập tương tác</h3>
              <p className="text-sm text-muted-foreground">
                Trải nghiệm thực hành với trực quan hóa thời gian thực và hướng dẫn từng bước
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="font-semibold mb-2">Nội dung toàn diện</h3>
              <p className="text-sm text-muted-foreground">
                Từ mảng cơ bản đến thuật toán nâng cao, mọi thứ bạn cần để thành công
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="font-semibold mb-2">Tập trung vào hiệu suất</h3>
              <p className="text-sm text-muted-foreground">
                Hiểu độ phức tạp thời gian và tối ưu hóa thông qua phân tích trực quan
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
