import React, { useRef, useState } from 'react';
import { Play, Code2, ChevronDown, BookOpen, Terminal, Upload, Image as ImageIcon, Loader2, Square, Globe } from 'lucide-react';
import { extractCodeFromImage } from '../services/geminiService';

type Language = 'python' | 'cpp' | 'java' | 'c';

interface Example {
  name: string;
  code: string;
}

/**
 * Static repository of example algorithms for supported languages.
 * Provides instant boilerplate code for quick demonstrations and testing.
 */
const ALGORITHM_EXAMPLES: Record<Language, Record<string, Example>> = {
  python: {
    fibonacci: { name: "Fibonacci", code: "def fib(n):\n    if n <= 1: return n\n    return fib(n-1) + fib(n-2)\nprint(fib(4))" },
    merge_sort: { name: "Merge Sort", code: "def merge_sort(arr):\n    if len(arr) <= 1: return arr\n    mid = len(arr) // 2\n    left = merge_sort(arr[:mid])\n    right = merge_sort(arr[mid:])\n    return merge(left, right)\n\ndef merge(left, right):\n    result = []\n    i = j = 0\n    while i < len(left) and j < len(right):\n        if left[i] < right[j]:\n            result.append(left[i])\n            i += 1\n        else:\n            result.append(right[j])\n            j += 1\n    result.extend(left[i:])\n    result.extend(right[j:])\n    return result\n\nprint(merge_sort([38, 27, 43, 3]))" },
    quick_sort: { name: "Quick Sort", code: "def quick_sort(arr):\n    if len(arr) <= 1: return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quick_sort(left) + middle + quick_sort(right)\n\nprint(quick_sort([10, 7, 8, 9, 1, 5]))" },
    coin_change: { name: "Coin Change", code: "def coin_change(coins, amount):\n    if amount == 0: return 0\n    if amount < 0: return float('inf')\n    min_coins = float('inf')\n    for coin in coins:\n        res = coin_change(coins, amount - coin)\n        if res != float('inf'):\n            min_coins = min(min_coins, res + 1)\n    return min_coins\n\nprint(coin_change([1, 2, 3], 4))" }
  },
  cpp: {
    fibonacci: { name: "Fibonacci", code: "#include <iostream>\nusing namespace std;\n\nint fib(int n) {\n    if (n <= 1) return n;\n    return fib(n-1) + fib(n-2);\n}\n\nint main() {\n    cout << fib(4) << endl;\n    return 0;\n}" },
    merge_sort: { name: "Merge Sort", code: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nvoid merge(vector<int>& arr, int l, int m, int r) {\n    int n1 = m - l + 1;\n    int n2 = r - m;\n    vector<int> L(n1), R(n2);\n    for (int i = 0; i < n1; i++) L[i] = arr[l + i];\n    for (int j = 0; j < n2; j++) R[j] = arr[m + 1 + j];\n    int i = 0, j = 0, k = l;\n    while (i < n1 && j < n2) {\n        if (L[i] <= R[j]) arr[k++] = L[i++];\n        else arr[k++] = R[j++];\n    }\n    while (i < n1) arr[k++] = L[i++];\n    while (j < n2) arr[k++] = R[j++];\n}\n\nvoid mergeSort(vector<int>& arr, int l, int r) {\n    if (l >= r) return;\n    int m = l + (r - l) / 2;\n    mergeSort(arr, l, m);\n    mergeSort(arr, m + 1, r);\n    merge(arr, l, m, r);\n}\n\nint main() {\n    vector<int> arr = {38, 27, 43, 3, 9, 82, 10};\n    mergeSort(arr, 0, arr.size() - 1);\n    for (int x : arr) cout << x << \" \";\n    return 0;\n}" },
    quick_sort: { name: "Quick Sort", code: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint partition(vector<int>& arr, int low, int high) {\n    int pivot = arr[high];\n    int i = (low - 1);\n    for (int j = low; j <= high - 1; j++) {\n        if (arr[j] < pivot) {\n            i++;\n            swap(arr[i], arr[j]);\n        }\n    }\n    swap(arr[i + 1], arr[high]);\n    return (i + 1);\n}\n\nvoid quickSort(vector<int>& arr, int low, int high) {\n    if (low < high) {\n        int pi = partition(arr, low, high);\n        quickSort(arr, low, pi - 1);\n        quickSort(arr, pi + 1, high);\n    }\n}\n\nint main() {\n    vector<int> arr = {10, 7, 8, 9, 1, 5};\n    quickSort(arr, 0, arr.size() - 1);\n    for (int x : arr) cout << x << \" \";\n    return 0;\n}" },
    coin_change: { name: "Coin Change", code: "#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint coinChange(vector<int>& coins, int amount) {\n    if (amount == 0) return 0;\n    if (amount < 0) return 1e9;\n    int min_coins = 1e9;\n    for (int coin : coins) {\n        int res = coinChange(coins, amount - coin);\n        if (res != 1e9) min_coins = min(min_coins, res + 1);\n    }\n    return min_coins;\n}\n\nint main() {\n    vector<int> coins = {1, 2, 3};\n    cout << coinChange(coins, 4) << endl;\n    return 0;\n}" }
  },
  java: {
    fibonacci: { name: "Fibonacci", code: "public class Main {\n    public static int fib(int n) {\n        if (n <= 1) return n;\n        return fib(n-1) + fib(n-2);\n    }\n    public static void main(String[] args) {\n        System.out.println(fib(4));\n    }\n}" },
    merge_sort: { name: "Merge Sort", code: "import java.util.Arrays;\npublic class Main {\n    void merge(int arr[], int l, int m, int r) {\n        int n1 = m - l + 1;\n        int n2 = r - m;\n        int L[] = new int[n1];\n        int R[] = new int[n2];\n        for (int i = 0; i < n1; ++i) L[i] = arr[l + i];\n        for (int j = 0; j < n2; ++j) R[j] = arr[m + 1 + j];\n        int i = 0, j = 0, k = l;\n        while (i < n1 && j < n2) {\n            if (L[i] <= R[j]) arr[k++] = L[i++];\n            else arr[k++] = R[j++];\n        }\n        while (i < n1) arr[k++] = L[i++];\n        while (j < n2) arr[k++] = R[j++];\n    }\n    void sort(int arr[], int l, int r) {\n        if (l < r) {\n            int m = l + (r - l) / 2;\n            sort(arr, l, m);\n            sort(arr, m + 1, r);\n            merge(arr, l, m, r);\n        }\n    }\n    public static void main(String args[]) {\n        int arr[] = {12, 11, 13, 5, 6, 7};\n        Main ob = new Main();\n        ob.sort(arr, 0, arr.length - 1);\n        System.out.println(Arrays.toString(arr));\n    }\n}" },
    quick_sort: { name: "Quick Sort", code: "import java.util.Arrays;\npublic class Main {\n    int partition(int arr[], int low, int high) {\n        int pivot = arr[high];\n        int i = (low-1);\n        for (int j=low; j<high; j++) {\n            if (arr[j] < pivot) {\n                i++;\n                int temp = arr[i];\n                arr[i] = arr[j];\n                arr[j] = temp;\n            }\n        }\n        int temp = arr[i+1];\n        arr[i+1] = arr[high];\n        arr[high] = temp;\n        return i+1;\n    }\n    void sort(int arr[], int low, int high) {\n        if (low < high) {\n            int pi = partition(arr, low, high);\n            sort(arr, low, pi-1);\n            sort(arr, pi+1, high);\n        }\n    }\n    public static void main(String args[]) {\n        int arr[] = {10, 7, 8, 9, 1, 5};\n        Main ob = new Main();\n        ob.sort(arr, 0, arr.length-1);\n        System.out.println(Arrays.toString(arr));\n    }\n}" },
    coin_change: { name: "Coin Change", code: "public class Main {\n    static int coinChange(int[] coins, int amount) {\n        if (amount == 0) return 0;\n        if (amount < 0) return Integer.MAX_VALUE;\n        int min = Integer.MAX_VALUE;\n        for (int coin : coins) {\n            int res = coinChange(coins, amount - coin);\n            if (res != Integer.MAX_VALUE) {\n                min = Math.min(min, res + 1);\n            }\n        }\n        return min;\n    }\n    public static void main(String[] args) {\n        int[] coins = {1, 2, 3};\n        System.out.println(coinChange(coins, 4));\n    }\n}" }
  },
  c: {
    fibonacci: { name: "Fibonacci", code: "#include <stdio.h>\n\nint fib(int n) {\n    if (n <= 1) return n;\n    return fib(n-1) + fib(n-2);\n}\n\nint main() {\n    printf(\"%d\", fib(4));\n    return 0;\n}" },
    merge_sort: { name: "Merge Sort", code: "#include <stdio.h>\n\nvoid merge(int arr[], int l, int m, int r) {\n    int i, j, k;\n    int n1 = m - l + 1;\n    int n2 = r - m;\n    int L[n1], R[n2];\n    for (i = 0; i < n1; i++) L[i] = arr[l + i];\n    for (j = 0; j < n2; j++) R[j] = arr[m + 1 + j];\n    i = 0; j = 0; k = l;\n    while (i < n1 && j < n2) {\n        if (L[i] <= R[j]) arr[k++] = L[i++];\n        else arr[k++] = R[j++];\n    }\n    while (i < n1) arr[k++] = L[i++];\n    while (j < n2) arr[k++] = R[j++];\n}\n\nvoid mergeSort(int arr[], int l, int r) {\n    if (l < r) {\n        int m = l + (r - l) / 2;\n        mergeSort(arr, l, m);\n        mergeSort(arr, m + 1, r);\n        merge(arr, l, m, r);\n    }\n}\n\nint main() {\n    int arr[] = {38, 27, 43, 3, 9, 82, 10};\n    int n = sizeof(arr) / sizeof(arr[0]);\n    mergeSort(arr, 0, n - 1);\n    for (int i = 0; i < n; i++) printf(\"%d \", arr[i]);\n    return 0;\n}" },
    quick_sort: { name: "Quick Sort", code: "#include <stdio.h>\n\nvoid swap(int* a, int* b) {\n    int t = *a;\n    *a = *b;\n    *b = t;\n}\n\nint partition(int arr[], int low, int high) {\n    int pivot = arr[high];\n    int i = (low - 1);\n    for (int j = low; j <= high - 1; j++) {\n        if (arr[j] < pivot) {\n            i++;\n            swap(&arr[i], &arr[j]);\n        }\n    }\n    swap(&arr[i + 1], &arr[high]);\n    return (i + 1);\n}\n\nvoid quickSort(int arr[], int low, int high) {\n    if (low < high) {\n        int pi = partition(arr, low, high);\n        quickSort(arr, low, pi - 1);\n        quickSort(arr, pi + 1, high);\n    }\n}\n\nint main() {\n    int arr[] = {10, 7, 8, 9, 1, 5};\n    int n = sizeof(arr) / sizeof(arr[0]);\n    quickSort(arr, 0, n - 1);\n    for (int i = 0; i < n; i++) printf(\"%d \", arr[i]);\n    return 0;\n}" },
    coin_change: { name: "Coin Change", code: "#include <stdio.h>\n#include <limits.h>\n\nint coin_change(int coins[], int num_coins, int amount) {\n    if (amount == 0) return 0;\n    if (amount < 0) return INT_MAX;\n    int min_coins = INT_MAX;\n    for (int i = 0; i < num_coins; i++) {\n        int res = coin_change(coins, num_coins, amount - coins[i]);\n        if (res != INT_MAX) {\n            if (res + 1 < min_coins) min_coins = res + 1;\n        }\n    }\n    return min_coins;\n}\n\nint main() {\n    int coins[] = {1, 2, 3};\n    printf(\"%d\", coin_change(coins, 3, 4));\n    return 0;\n}" }
  }
};

interface InputPanelProps {
  code: string;
  setCode: (code: string) => void;
  onVisualize: () => void;
  onStop: () => void;
  isAnalyzing: boolean;
}

/**
 * InputPanel Component
 * * Primary interface for user interactions.
 * * Key Features:
 * - Code Editor: Syntax-aware text area.
 * - Preset Loader: Loads standard algorithms (Sort, Fibonacci) for quick testing.
 * - OCR Integration: Uploads images to extract code using AI service.
 * - Language Switcher: Toggles between Python, C++, Java, and C.
 */
const InputPanel: React.FC<InputPanelProps> = ({ code, setCode, onVisualize, onStop, isAnalyzing }) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [selectedLang, setSelectedLang] = useState<Language>('python');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Updates the editor boilerplate when language is switched
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as Language;
    setSelectedLang(newLang);
    if (newLang === 'python') setCode("# Python Code Here\n");
    if (newLang === 'cpp') setCode("// C++ Code Here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write code\n    return 0;\n}");
    if (newLang === 'java') setCode("// Java Code Here\npublic class Main {\n    public static void main(String[] args) {\n        // Write code\n    }\n}");
    if (newLang === 'c') setCode("// C Code Here\n#include <stdio.h>\n\nint main() {\n    // Write code\n    return 0;\n}");
  };

  // Loads pre-defined algorithm snippets into the editor
  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedKey = e.target.value;
    const examples = ALGORITHM_EXAMPLES[selectedLang];
    
    if (selectedKey && examples[selectedKey]) {
      setCode(examples[selectedKey].code);
    }
  };

  // Handles image-to-text conversion (OCR) via external service
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    try {
      // Call AI service to extract code from the uploaded image
      const extractedCode = await extractCodeFromImage(file);
      setCode(extractedCode);
    } catch (error) {
      console.error("Extract error:", error);
      setCode("# Error: Could not extract code from image.");
    } finally {
      setIsExtracting(false);
      // Reset input to allow re-uploading the same file if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0e] border-r border-gray-800">
      
      {/* 1. HEADER (MELITA) - Branding Section */}
      <div className="p-6 border-b border-gray-800 bg-gray-900/30">
        <div className="flex items-center space-x-4 mb-2">
          <div className="relative group">
             <div className="absolute -inset-1 bg-fuchsia-500/20 rounded-full blur group-hover:bg-fuchsia-500/40 transition-all"></div>
             <Terminal className="w-9 h-9 text-fuchsia-500 relative z-10" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-wide leading-none">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-fuchsia-500 to-purple-600 drop-shadow-[0_2px_10px_rgba(192,38,211,0.3)]">
                Melita
              </span>
            </h1>
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-1.5">
             <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
            <span className="text-[11px] text-cyan-400 font-mono tracking-[0.3em] uppercase opacity-90 font-semibold">
                AI Algorithm Assistant
            </span>
        </div>
      </div>

      {/* 2. TOOLBAR - Language & Preset Selection */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900/50 border-b border-gray-800 backdrop-blur-sm">
        
        <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <select
                value={selectedLang}
                onChange={handleLanguageChange}
                disabled={isAnalyzing}
                className="bg-gray-800 text-cyan-400 text-xs font-bold tracking-wider rounded border border-gray-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none uppercase py-1 px-2 cursor-pointer hover:bg-gray-750 transition-colors"
            >
                <option value="python">PYTHON</option>
                <option value="cpp">C++</option>
                <option value="java">JAVA</option>
                <option value="c">C (STD)</option>
            </select>
        </div>

        <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <BookOpen className="h-3 w-3 text-gray-400" />
            </div>
            <select 
                onChange={handlePresetChange}
                disabled={isAnalyzing}
                className="pl-7 pr-8 py-1 bg-gray-800 text-gray-300 text-xs font-mono rounded border border-gray-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 appearance-none cursor-pointer outline-none hover:bg-gray-750 transition-colors w-32 disabled:opacity-50 disabled:cursor-not-allowed"
                defaultValue=""
            >
                <option value="" disabled>Load Ex.</option>
                <option value="fibonacci">Fibonacci</option>
                <option value="merge_sort">Merge Sort</option>
                <option value="quick_sort">Quick Sort</option>
                <option value="coin_change">Coin Change</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                <ChevronDown className="h-3 w-3 text-gray-500" />
            </div>
        </div>
      </div>

      {/* 3. EDITOR - Code Input Area */}
      <div className="flex-grow relative group">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          readOnly={isAnalyzing}
          className={`w-full h-full p-5 bg-[#0a0a0e] text-gray-300 font-mono text-sm resize-none focus:outline-none focus:ring-1 focus:ring-cyan-900/30 selection:bg-cyan-900/30 leading-relaxed ${isAnalyzing ? 'opacity-70 cursor-wait' : ''}`}
          placeholder={`// Paste your ${selectedLang.toUpperCase()} code here...`}
          spellCheck={false}
        />
        {/* Loading overlay for image scanning */}
        {isExtracting && (
           <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
              <Loader2 className="w-10 h-10 text-fuchsia-500 animate-spin mb-3" />
              <span className="text-fuchsia-400 font-mono text-sm tracking-widest animate-pulse">SCANNING IMAGE...</span>
           </div>
        )}
        
        {/* Language Indicator Badge */}
        <div className="absolute bottom-4 right-4 text-[10px] text-gray-600 font-mono pointer-events-none border border-gray-800/50 px-2 py-1 rounded bg-black/20">
          {selectedLang === 'python' ? 'PYTHON 3.11' : selectedLang === 'cpp' ? 'C++ 20' : selectedLang === 'java' ? 'JAVA 21' : 'C17 (GCC)'}
        </div>
      </div>

      {/* 4. ACTIONS - Upload & Visualize Buttons */}
      <div className="p-4 bg-gray-900/50 border-t border-gray-800 flex gap-3">
        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isAnalyzing}
          className="flex items-center justify-center px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg border border-gray-700 transition-all hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed group"
          title="Upload Code from Image"
        >
          {isExtracting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5 group-hover:text-white transition-colors" />}
          <span className="ml-2 font-mono text-sm font-bold hidden xl:inline">UPLOAD</span>
        </button>

        {isAnalyzing ? (
          <button
            onClick={onStop}
            className="flex-grow flex items-center justify-center space-x-2 py-3 rounded-lg font-bold tracking-wide transition-all duration-300 bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] animate-pulse"
          >
             <Square className="w-5 h-5 fill-current" />
             <span className="font-mono text-sm">STOP GENERATING</span>
          </button>
        ) : (
          <button
            onClick={onVisualize}
            disabled={isExtracting || !code.trim()}
            className="flex-grow flex items-center justify-center space-x-2 py-3 rounded-lg font-bold tracking-wide transition-all duration-300 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white shadow-[0_0_20px_rgba(192,38,211,0.3)] hover:shadow-[0_0_30px_rgba(192,38,211,0.5)] transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-5 h-5 fill-current" />
            <span className="font-mono text-sm">VISUALIZE & EXPLAIN</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default InputPanel;