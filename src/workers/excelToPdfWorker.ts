const excelToPdfWorker = new Worker(
  new URL('./excelToPdfWorker.js', import.meta.url)
);

export { excelToPdfWorker };
