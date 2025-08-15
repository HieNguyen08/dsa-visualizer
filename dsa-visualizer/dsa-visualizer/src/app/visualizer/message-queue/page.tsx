import MessageQueueSchedulerVisualizer from '@/components/visualizers/message-queue-scheduler-visualizer';
import { AlgorithmPrinciple } from "@/components/shared/algorithm-principle";

export default function MessageQueuePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Bộ Lập Lịch Message Queue</h1>
            <p className="text-muted-foreground mb-6 max-w-2xl">
              Trình mô phỏng hệ thống lập lịch message queue nâng cao với các thuật toán scheduling khác nhau
              và metrics thời gian thực.
            </p>
          </div>
          <div className="mb-4 sm:mb-0">
            <AlgorithmPrinciple 
              title="Bộ Lập Lịch Message Queue"
              description="Hệ thống scheduling phức tạp để quản lý và xử lý message queues với nhiều thuật toán scheduling khác nhau."
              timeComplexity={{
                best: "O(1) - O(log n)",
                average: "O(log n)", 
                worst: "O(n)"
              }}
              spaceComplexity="O(n)"
              principles={[
                "FIFO, Priority, SJF, Round Robin scheduling",
                "Real-time metrics tracking",
                "Queue management và load balancing",
                "Throughput và latency optimization"
              ]}
              keySteps={[
                "Message arrives vào queue system",
                "Scheduler chọn message theo algorithm",
                "Processing message với simulated work time",
                "Update metrics (wait time, response time)",
                "Continue với next message trong queue"
              ]}
              applications={[
                "Distributed systems message processing",
                "Microservices communication",
                "Event-driven architectures",
                "Task scheduling trong cloud platforms",
                "Real-time streaming applications",
                "IoT data processing pipelines",
                "Web server request handling",
                "Database transaction queuing"
              ]}
              advantages={[
                "Scalable message processing",
                "Multiple scheduling algorithms",
                "Real-time performance monitoring",
                "Load balancing capabilities"
              ]}
              disadvantages={[
                "Complexity tăng với scale",
                "Potential bottlenecks tại scheduler",
                "Memory overhead cho queue management"
              ]}
            />
          </div>
        </div>
        <MessageQueueSchedulerVisualizer />
      </div>
    </div>
  );
}
