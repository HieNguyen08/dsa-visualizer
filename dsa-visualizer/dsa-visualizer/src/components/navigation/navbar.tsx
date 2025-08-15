"use client";
import { BrainCircuit, Github, Menu } from "lucide-react";
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ModeToggle } from "@/components/global/mode-toggle";

interface RouteProps {
  href: string;
  label: string;
}

export interface FeatureProps {
  title: string;
  description: string;
  url: string;
}

const routeList: RouteProps[] = [
  {
    href: "/dashboard",
    label: "Bảng điều khiển",
  },
  {
    href: "/sorting/comparison",
    label: "So sánh thuật toán",
  },
  {
    href: "/playground",
    label: "Khu vực thử nghiệm",
  },
  {
    href: "/profiler",
    label: "Phân tích hiệu suất",
  },
  {
    href: "/learn",
    label: "Học tập",
  },
  {
    href: "/community",
    label: "Cộng đồng",
  },
  {
    href: "/ai-assistant",
    label: "Trợ lý AI",
  },
];

export const featureList: FeatureProps[] = [
  // Data Structures
  {
    title: "Stack (Ngăn xếp)",
    description: "Trực quan hóa các phép toán LIFO: push, pop, peek với hiển thị ngăn xếp thời gian thực.",
    url: "/visualizer/stack"
  },
  {
    title: "Queue (Hàng đợi)",
    description: "Trực quan hóa các phép toán FIFO: enqueue, dequeue, front với triển khai hàng đợi tròn và tuyến tính.",
    url: "/visualizer/queue"
  },
  {
    title: "Linked Lists (Danh sách liên kết)",
    description: "Các phép toán danh sách liên kết đơn, đôi và tròn tương tác với trực quan hóa bộ nhớ.",
    url: "/visualizer/linked-list"
  },
  {
    title: "Hash Tables (Bảng băm)",
    description: "Trực quan hóa bảng băm tương tác với chiến lược giải quyết xung đột và phân tích hiệu suất.",
    url: "/visualizer/hash-table"
  },
  {
    title: "Heap Data Structure (Cấu trúc dữ liệu heap)",
    description: "Trực quan hóa các phép toán heap min/max bao gồm chèn, xóa và duy trì thuộc tính heap.",
    url: "/visualizer/heap"
  },
  
  // Tree Algorithms
  {
    title: "Binary Search Trees (Cây tìm kiếm nhị phân)",
    description: "Các phép toán BST tương tác: chèn, xóa, tìm kiếm với trực quan hóa cân bằng cây.",
    url: "/visualizer/binary-tree"
  },
  {
    title: "AVL Trees (Cây AVL)",
    description: "BST tự cân bằng với các phép xoay và trực quan hóa hệ số cân bằng.",
    url: "/visualizer/avl-tree"
  },
  {
    title: "Huffman Coding (Mã hóa Huffman)",
    description: "Xây dựng cây Huffman để nén dữ liệu với phân tích tần số và trực quan hóa mã hóa.",
    url: "/visualizer/huffman"
  },
  
  // Sorting Algorithms
  {
    title: "Thuật Toán Sắp Xếp",
    description: "Trực quan hóa 8+ thuật toán sắp xếp: Bubble, Selection, Insertion, Quick, Merge, Heap, Radix, v.v.",
    url: "/sorting"
  },
  {
    title: "Merge Sort (Sắp xếp trộn)",
    description: "Sắp xếp chia để trị với xem dạng cây và hoạt ảnh trộn từng bước.",
    url: "/visualizer/merge-sort"
  },
  {
    title: "Heap Sort (Sắp xếp heap)",
    description: "Sắp xếp tại chỗ sử dụng cấu trúc dữ liệu heap với trực quan hóa các phép toán heapify.",
    url: "/visualizer/heap-sort"
  },
  {
    title: "So Sánh Thuật Toán",
    description: "So sánh cạnh nhau các thuật toán sắp xếp với chỉ số hiệu suất và phân tích độ phức tạp.",
    url: "/sorting/comparison"
  },
  
  // Graph Algorithms
  {
    title: "Thuật Toán Đồ Thị",
    description: "Trực quan hóa DFS, BFS, đường đi ngắn nhất Dijkstra và sắp xếp tô-pô trên đồ thị tương tác.",
    url: "/visualizer/graph-algorithms"
  },
  {
    title: "Thuật Toán Tìm Đường",
    description: "A*, Dijkstra, BFS, DFS tìm đường trên lưới với chướng ngại vật và trực quan hóa heuristics.",
    url: "/pathfinding"
  },
  {
    title: "Cây Khung Tối Thiểu",
    description: "Thuật toán Kruskal và Prim cho MST với Union-Find và chỉnh sửa đồ thị tương tác.",
    url: "/visualizer/mst"
  },
  
  // Dynamic Programming
  {
    title: "Quy Hoạch Động",
    description: "Các bài toán DP cổ điển: LCS, Edit Distance, Knapsack, Fibonacci với trực quan hóa bảng.",
    url: "/visualizer/dynamic-programming"
  },
  
  // String Algorithms
  {
    title: "Thuật Toán Tìm Kiếm Chuỗi",
    description: "Thuật toán KMP và Boyer-Moore để tìm kiếm mẫu hiệu quả với trực quan hóa hàm thất bại.",
    url: "/visualizer/string-matching"
  },
  
  // Application Problems
  {
    title: "Ứng Dụng Stack",
    description: "Chuyển đổi trung tố sang hậu tố, tính toán biểu thức và kiểm tra dấu ngoặc cân bằng.",
    url: "/visualizer/stack-applications"
  },
  {
    title: "Ứng Dụng Queue", 
    description: "Lập lịch hàng đợi tin nhắn với FIFO, Priority, SJF và thuật toán Round Robin.",
    url: "/visualizer/queue-applications"
  },
  {
    title: "Phép Toán Đa Thức",
    description: "Cộng, nhân và tính giá trị đa thức sử dụng danh sách liên kết và mảng.",
    url: "/visualizer/polynomial"
  },
  
  // Advanced Visualizers
  {
    title: "Bộ Lập Lịch Hàng Đợi Tin Nhắn",
    description: "Thuật toán lập lịch nâng cao với chỉ số thời gian thực: throughput, thời gian chờ, thời gian phản hồi.",
    url: "/visualizer/message-queue"
  },
  
  // Learning & Tools
  {
    title: "Sân Chơi Thuật Toán",
    description: "Môi trường lập trình tương tác với trợ lý AI, thử thách và phản hồi thời gian thực.",
    url: "/playground"
  },
  {
    title: "Bộ Phân Tích Hiệu Suất",
    description: "Đánh giá hiệu suất thuật toán với phân tích độ phức tạp và so sánh thời gian chạy.",
    url: "/profiler"
  },
  {
    title: "Trung Tâm Học Tập",
    description: "Hướng dẫn từng bước và giải thích lý thuyết để thành thạo thuật toán và cấu trúc dữ liệu.",
    url: "/learn"
  },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <header className="shadow-inner bg-opacity-15 w-[90%] md:w-[70%] lg:w-[75%] lg:max-w-screen-xl top-5 mx-auto sticky border border-secondary z-40 rounded-2xl flex justify-between items-center p-2 bg-card/60 backdrop-blur-md">
      <Link href="/" className="font-bold text-lg flex items-center">
        <BrainCircuit className="h-6 w-6 mr-2" />
        DS Visualizer
      </Link>

      {/* Mobile Menu */}
      <div className="flex items-center lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Menu
              onClick={() => setIsOpen(!isOpen)}
              className="cursor-pointer lg:hidden"
            />
          </SheetTrigger>

          <SheetContent
            side="left"
            className="flex flex-col justify-between rounded-tr-2xl rounded-br-2xl bg-card border-secondary"
          >
            <div>
              <SheetHeader className="mb-4 ml-4">
                <SheetTitle className="flex items-center">
                  <Link href="/" className="flex items-center">
                    <BrainCircuit className="h-6 w-6 mr-2" />
                    DS Visualizer
                  </Link>
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-2">
                {routeList.map(({ href, label }) => (
                  <Button
                    key={href}
                    onClick={() => setIsOpen(false)}
                    asChild
                    variant="secondary"
                    className="justify-start text-base"
                  >
                    <Link href={href}>{label}</Link>
                  </Button>
                ))}
              </div>
            </div>

            <SheetFooter className="flex-col sm:flex-col justify-start items-start">
              <Separator className="mb-2" />
              <ModeToggle />
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Menu */}
      <NavigationMenu className="hidden lg:block mx-auto">
        <NavigationMenuList className="gap-4">
          {routeList.map(({ href, label }) => (
            <NavigationMenuItem key={href}>
              <NavigationMenuLink asChild>
                <Link href={href} className="px-3 py-2 text-sm font-medium hover:bg-muted rounded-md">
                  {label}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>

      <div className="hidden lg:flex items-center gap-2">
        <ModeToggle />
        <Button asChild size="sm" variant="ghost" aria-label="View on GitHub">
          <Link
            aria-label="View on GitHub"
            href="https://github.com/yourusername/ds-visualizer"
            target="_blank"
          >
            <Github className="size-5" />
          </Link>
        </Button>
      </div>
    </header>
  );
};