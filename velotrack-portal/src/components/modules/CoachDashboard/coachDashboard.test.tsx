import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DASHBOARD_REPORT_URL } from "@/utils/constants/dashboard";

import CoachDashboard from ".";

describe("CoachDashboard", () => {
  it("embebe el reporte de Looker Studio", () => {
    render(<CoachDashboard />);
    const frame = screen.getByTitle("Dashboard del entrenador");
    expect(frame).toHaveAttribute("src", DASHBOARD_REPORT_URL);
    expect(frame).toHaveAttribute("sandbox");
  });
});
