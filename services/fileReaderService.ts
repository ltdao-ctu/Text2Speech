
export const readFilesAsText = async (files: File[]): Promise<string> => {
  let combinedText = "";

  for (const file of files) {
    let text = "";
    if (file.type === 'text/plain') {
      text = await readTxtFile(file);
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      text = await readDocxFile(file);
    } else {
      console.warn(`Unsupported file type: ${file.name} (${file.type})`);
    }
    if (text) {
      combinedText += text + "\n\n";
    }
  }

  return combinedText.trim();
};

const readTxtFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
};

const readDocxFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      if (arrayBuffer) {
        try {
          const result = await window.mammoth.extractRawText({ arrayBuffer });
          resolve(result.value);
        } catch (error) {
          reject(error);
        }
      } else {
        reject(new Error("Failed to read DOCX file."));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
};
