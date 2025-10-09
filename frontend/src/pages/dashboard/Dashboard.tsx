import React, { useEffect } from "react";
import { privateRequest } from "../../config/requestMethod";
import { Button } from "@mantine/core";

const Dashboard = () => {
  useEffect(() => {
    privateRequest.get("/status");
  }, []);

  const handleBtn = () => {
    privateRequest.get("/status");
  };

  const handleRefreshCall = () => {
    privateRequest.get("/refresh-token");
  };

  return (
    <div>
      Dashboard
      <Button onClick={handleBtn}> HANDLE </Button>
      <Button onClick={handleRefreshCall}> HANDLE </Button>
    </div>
  );
};

export default Dashboard;
