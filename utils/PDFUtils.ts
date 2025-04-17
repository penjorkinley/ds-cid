export class PDFUtils {
  /**
   * Get ordinal suffix for a number (1st, 2nd, 3rd, etc.)
   */
  static getOrdinalSuffix(num: number): string {
    const j = num % 10;
    const k = num % 100;

    if (j === 1 && k !== 11) {
      return num + "st";
    }
    if (j === 2 && k !== 12) {
      return num + "nd";
    }
    if (j === 3 && k !== 13) {
      return num + "rd";
    }
    return num + "th";
  }

  /**
   * Get color styling for a placeholder based on its order
   */
  static getPlaceholderColor(order: number): {
    border: string;
    bg: string;
    text: string;
  } {
    const colors = [
      { border: "border-blue-500", bg: "bg-blue-100", text: "text-blue-700" },
      {
        border: "border-green-500",
        bg: "bg-green-100",
        text: "text-green-700",
      },
      {
        border: "border-purple-500",
        bg: "bg-purple-100",
        text: "text-purple-700",
      },
      {
        border: "border-yellow-500",
        bg: "bg-yellow-100",
        text: "text-yellow-700",
      },
      { border: "border-pink-500", bg: "bg-pink-100", text: "text-pink-700" },
      {
        border: "border-indigo-500",
        bg: "bg-indigo-100",
        text: "text-indigo-700",
      },
    ];

    return colors[(order - 1) % colors.length];
  }
}
