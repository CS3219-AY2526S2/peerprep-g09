fetch("http://localhost:8082/status")
  .then((response) => response.json())
  .then((data) => {
    console.log("Queue Status:", data);
  })
  .catch((error) => {
    console.error("Error fetching queue status:", error);
  });
