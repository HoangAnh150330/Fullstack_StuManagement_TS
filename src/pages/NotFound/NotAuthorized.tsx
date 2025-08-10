export default function NotAuthorized() {
  return (
    <div className="p-6 text-center">
      <h2 className="text-xl font-bold text-red-600 mb-2">
        403 - Không có quyền truy cập
      </h2>
      <p className="text-gray-700">
        Bạn không có quyền vào trang này.
      </p>
    </div>
  );
}
