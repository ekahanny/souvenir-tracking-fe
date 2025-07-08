import { ProgressSpinner } from "primereact/progressspinner";

export function LoadingSpinner() {
  return (
    <div className="card flex justify-center items-center h-screen">
      <ProgressSpinner
        style={{ width: "50px", height: "50px" }}
        strokeWidth="8"
        fill="#e2e8f0"
        animationDuration="1s"
      />
    </div>
  );
}
