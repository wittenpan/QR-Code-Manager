// app/lib/monitoring.ts
export function reportWebVitals(metric: any) {
  console.log(metric); // Replace with actual monitoring service

  if (metric.label === "web-vital") {
    // Send to analytics
    const analytics = {
      name: metric.name,
      value: metric.value,
      id: metric.id,
    };

    // Example: send to monitoring service
    // await fetch('/api/metrics', {
    //   method: 'POST',
    //   body: JSON.stringify(analytics)
    // });
  }
}
