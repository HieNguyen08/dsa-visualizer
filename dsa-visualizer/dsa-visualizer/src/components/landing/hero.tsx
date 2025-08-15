"use client";

import { MoveRight, Github, Play, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { DotPattern } from "@/components/ui/dot-pattern";
import Image from "next/image";
import Link from "next/link";

export const Hero = () => (
  <div className="relative w-full py-20 lg:py-32 overflow-hidden">
    <div className="absolute inset-0">
      <DotPattern
        width={20}
        height={20}
        cx={1}
        cy={1}
        cr={1}
        className="[mask-image:radial-gradient(1000px_circle_at_center,white,transparent)]"
      />
    </div>

    {/* Gradient background */}
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5" />

    <div className="container mx-auto relative px-4">
      <div className="grid grid-cols-1 gap-12 items-center lg:grid-cols-2">
        <div className="flex gap-6 flex-col">
          {/* Badge */}
          <div className="flex justify-start">
            <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Nền tảng học tương tác
            </div>
          </div>

          <div className="flex gap-6 flex-col">
            <h1 className="text-4xl md:text-6xl lg:text-7xl max-w-lg tracking-tighter text-left font-bold bg-gradient-to-r from-foreground via-primary to-purple-600 bg-clip-text text-transparent">
              Thành thạo cấu trúc dữ liệu một cách trực quan
            </h1>
            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-md text-left">
              Chuyển đổi các thuật toán phức tạp thành những hình ảnh tương tác đẹp mắt. 
              Học nhanh hơn với hoạt ảnh từng bước và thực hành trực tiếp.
            </p>
          </div>

          {/* Features highlight */}
          <div className="flex flex-col gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Hơn 50 trực quan hóa thuật toán tương tác</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Phân tích hiệu suất thời gian thực</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Học theo tốc độ riêng với ví dụ mã nguồn</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/visualizer">
              <RainbowButton className="w-full sm:w-auto gap-2 text-lg px-8 py-3">
                <Play className="w-5 h-5" />
                Bắt đầu học
                <MoveRight className="w-5 h-5" />
              </RainbowButton>
            </Link>
            
            <Link href="/dashboard">
              <Button className="w-full sm:w-auto gap-2 text-lg px-8 py-3" variant="outline">
                <BookOpen className="w-5 h-5" />
                Xem thuật toán
              </Button>
            </Link>
          </div>

          {/* GitHub link */}
          <div className="flex items-center gap-4 pt-4">
            <Link href="https://github.com/yourusername/dsa-visualizer">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                <Github className="w-4 h-4" />
                Xem trên GitHub
              </Button>
            </Link>
            <div className="text-sm text-muted-foreground">
              100% Miễn phí & Mã nguồn mở
            </div>
          </div>
        </div>

        <div className="relative">
          {/* Main preview card */}
          <div className="relative aspect-video rounded-2xl overflow-hidden border-2 shadow-2xl bg-gradient-to-br from-background to-muted/50">
            <Image
              src="/window.svg"
              alt="DSA Visualizer Preview"
              fill
              className="object-cover"
              priority
            />
            {/* Overlay with play button */}
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/30 transition-colors">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
                <Play className="w-8 h-8 text-primary-foreground ml-1" />
              </div>
            </div>
          </div>

          {/* Floating cards */}
          <div className="absolute -top-6 -left-6 bg-card border rounded-lg p-4 shadow-lg hidden lg:block">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Cây tìm kiếm nhị phân</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">Thời gian tìm kiếm O(log n)</div>
          </div>

          <div className="absolute -bottom-6 -right-6 bg-card border rounded-lg p-4 shadow-lg hidden lg:block">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Quick Sort</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">Trung bình O(n log n)</div>
          </div>

          <div className="absolute top-1/2 -right-4 bg-card border rounded-lg p-3 shadow-lg hidden lg:block transform -translate-y-1/2">
            <div className="text-2xl">🎯</div>
            <div className="text-xs text-muted-foreground mt-1">Tương tác</div>
          </div>
        </div>
      </div>

      {/* Trusted by section */}
      <div className="mt-20 text-center">
        <p className="text-sm text-muted-foreground mb-8">Được tin dùng bởi sinh viên từ các trường đại học hàng đầu trên thế giới</p>
        <div className="flex justify-center items-center gap-8 opacity-60">
          <div className="text-2xl">🎓</div>
          <div className="text-sm font-medium">MIT</div>
          <div className="text-2xl">🎓</div>
          <div className="text-sm font-medium">Stanford</div>
          <div className="text-2xl">🎓</div>
          <div className="text-sm font-medium">Berkeley</div>
          <div className="text-2xl">🎓</div>
          <div className="text-sm font-medium">Harvard</div>
        </div>
      </div>
    </div>
  </div>
);