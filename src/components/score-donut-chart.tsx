interface ScoreDonutChartProps {
  totalPositive: number;
  totalNegative: number;
  netScore: number;
  size?: number;
}

// Biểu đồ donut thuần SVG (không cần thư viện ngoài) — lát xanh thể hiện
// tổng điểm cộng, lát đỏ thể hiện tổng điểm trừ (trị tuyệt đối), tỉ lệ theo
// đúng tỉ trọng đóng góp của mỗi bên, không phải so với mốc 100.
export default function ScoreDonutChart({
  totalPositive,
  totalNegative,
  netScore,
  size = 160,
}: ScoreDonutChartProps) {
  const total = totalPositive + totalNegative;
  const radius = size / 2 - 12;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const positiveRatio = total === 0 ? 0 : totalPositive / total;
  const positiveLength = circumference * positiveRatio;

  const hasData = total > 0;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Nền xám khi chưa có dữ liệu */}
        {!hasData && (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#374151"
            strokeWidth={16}
          />
        )}

        {hasData && (
          <>
            {/* Lát đỏ — điểm trừ, vẽ trước làm nền */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#ef4444"
              strokeWidth={16}
              strokeDasharray={`${circumference} ${circumference}`}
              transform={`rotate(-90 ${center} ${center})`}
            />
            {/* Lát xanh — điểm cộng, vẽ chồng lên theo đúng tỉ lệ */}
            {positiveLength > 0 && (
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="#22c55e"
                strokeWidth={16}
                strokeDasharray={`${positiveLength} ${circumference}`}
                strokeLinecap={positiveRatio < 1 ? "butt" : "round"}
                transform={`rotate(-90 ${center} ${center})`}
              />
            )}
          </>
        )}

        <text
          x="50%"
          y="47%"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-white font-bold"
          style={{ fontSize: size * 0.22 }}
        >
          {netScore}
        </text>
        <text
          x="50%"
          y="63%"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-gray-500"
          style={{ fontSize: size * 0.08 }}
        >
          điểm
        </text>
      </svg>

      {hasData ? (
        <div className="flex items-center gap-4 text-xs mt-1">
          <span className="flex items-center gap-1.5 text-green-400">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />+
            {totalPositive}
          </span>
          <span className="flex items-center gap-1.5 text-red-400">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />-
            {totalNegative}
          </span>
        </div>
      ) : (
        <p className="text-xs text-gray-600 mt-1">Chưa có lượt đánh giá nào</p>
      )}
    </div>
  );
}
