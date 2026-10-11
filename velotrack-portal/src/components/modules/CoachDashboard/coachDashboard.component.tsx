"use client";
import {
  DASHBOARD_REPORT_SANDBOX,
  DASHBOARD_REPORT_URL,
} from "@/utils/constants/dashboard";

import CoachDashboardStyles from "./coachDashboard.styles";

// El dashboard es un reporte de Looker Studio embebido. Se ajusta al espacio
// disponible en lugar de usar un tamaño fijo.
const CoachDashboardComponent = () => (
  <div className="coachDashboard">
    <iframe
      className="coachDashboard__frame"
      title="Dashboard del entrenador"
      src={DASHBOARD_REPORT_URL}
      sandbox={DASHBOARD_REPORT_SANDBOX}
      allowFullScreen
    />

    <style jsx>{CoachDashboardStyles}</style>
  </div>
);

export default CoachDashboardComponent;
