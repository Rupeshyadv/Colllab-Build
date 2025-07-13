function Spinner() {
  return (
    <div className="flex items-center justify-center h-screen bg-black text-white">
      <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}

export default Spinner;