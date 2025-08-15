
import MessageQueueSchedulerVisualizer from '@/components/visualizers/message-queue-scheduler-visualizer';
import { AlgorithmPrinciple } from "@/components/shared/algorithm-principle";

export default function QueueApplicationsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Ứng Dụng Queue</h1>
            <p className="text-muted-foreground mb-6 max-w-2xl">
              Khám phá các ứng dụng thực tế của Queue như lập lịch message queue,
              xử lý buffer, và các hệ thống scheduling trong computer science.
            </p>
          </div>
          <div className="mb-4 sm:mb-0">
            <AlgorithmPrinciple 
              title="Ứng Dụng Queue"
              description="Queue được ứng dụng rộng rãi trong các hệ thống real-world như scheduling, buffering, và message passing systems."
              timeComplexity={{
                best: "O(1)",
                average: "O(1)", 
                worst: "O(1)"
              }}
              spaceComplexity="O(n)"
              principles={[
                "FIFO scheduling ensures fairness",
                "Buffering để handle rate differences",
                "Asynchronous message processing",
                "Load balancing và resource management"
              ]}
              keySteps={[
                "Producer adds messages to queue",
                "Consumer processes messages in FIFO order", 
                "Handle queue full/empty conditions",
                "Implement priority if needed",
                "Monitor queue performance metrics"
              ]}
              applications={[
                "Operating system process scheduling",
                "Print queue management",
                "Web server request handling",
                "Message queues (RabbitMQ, Kafka)",
                "BFS graph traversal",
                "CPU scheduling algorithms",
                "I/O buffer management",
                "Traffic management systems"
              ]}
              advantages={[
                "Fair processing (FIFO)",
                "Decoupling producers and consumers",
                "Smooth handling của traffic spikes",
                "Natural fit cho stream processing"
              ]}
              disadvantages={[
                "Potential for queue overflow",
                "Latency for high-priority items",
                "Memory usage grows with queue size",
                "No random access to items"
              ]}
            />
          </div>
        </div>
        <MessageQueueSchedulerVisualizer />
      </div>
    </div>
  );
}
