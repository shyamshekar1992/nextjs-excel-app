import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

export default function VendorCharts({ data }) {
  // 🛠 Debugging Data
  console.log("🔍 Debugging Data:", data);

  // 📊 Aggregate Customer Ratings (Count per Star)
  const customerRatingsData = [
    { name: "1 Star", value: data.filter((d) => d?.["Customer Rating"] === 1).length || 0 },
    { name: "2 Stars", value: data.filter((d) => d?.["Customer Rating"] === 2).length || 0 },
    { name: "3 Stars", value: data.filter((d) => d?.["Customer Rating"] === 3).length || 0 },
    { name: "4 Stars", value: data.filter((d) => d?.["Customer Rating"] === 4).length || 0 },
    { name: "5 Stars", value: data.filter((d) => d?.["Customer Rating"] === 5).length || 0 },
  ];

  // 📊 Aggregate Average Customer Rating per Vendor
  const vendorRatings = data.reduce((acc, vendor) => {
    const vendorName = vendor?.["AI Vendor"]?.trim() || "Unknown Vendor"; // Vendor Name
    const rating = vendor?.["Customer Rating"];

    // Skip vendors with no valid rating
    if (rating === undefined || rating === null || isNaN(rating)) return acc;

    if (!acc[vendorName]) {
      acc[vendorName] = { name: vendorName, totalRating: 0, count: 0 };
    }
    acc[vendorName].totalRating += rating;
    acc[vendorName].count += 1;
    return acc;
  }, {});

  // Convert to an array with the average rating per vendor
  const avgCustomerRatings = Object.values(vendorRatings).map((entry) => ({
    name: entry.name,
    averageRating: (entry.totalRating / entry.count).toFixed(2), // Average Rating
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mt-6">
      {/* 📊 Vendor Size Distribution Pie Chart */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-lg font-semibold text-center mb-2">
          Vendor Size Distribution
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={[
                { name: "Small", value: data.filter((d) => d?.["Vendor Size (Small/Medium/Large)"] === "Small").length || 0 },
                { name: "Medium", value: data.filter((d) => d?.["Vendor Size (Small/Medium/Large)"] === "Medium").length || 0 },
                { name: "Large", value: data.filter((d) => d?.["Vendor Size (Small/Medium/Large)"] === "Large").length || 0 },
              ]}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              <Cell fill="#3182CE" />
              <Cell fill="#38A169" />
              <Cell fill="#E53E3E" />
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 📊 Customer Focus Pie Chart */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-lg font-semibold text-center mb-2">
          Customer Focus Distribution
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={[
                { name: "Small", value: data.filter((d) => d?.["Customer Focus (Small / Medium / Enterprise)"] === "Small").length || 0 },
                { name: "Medium", value: data.filter((d) => d?.["Customer Focus (Small / Medium / Enterprise)"] === "Medium").length || 0 },
                { name: "Enterprise", value: data.filter((d) => d?.["Customer Focus (Small / Medium / Enterprise)"] === "Enterprise").length || 0 },
              ]}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              <Cell fill="#3182CE" />
              <Cell fill="#38A169" />
              <Cell fill="#E53E3E" />
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 📊 Vendor Count Bar Chart */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-lg font-semibold text-center mb-2">
          Vendor Category Distribution
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={[
              { name: "Small", value: data.filter((d) => d?.["Vendor Size (Small/Medium/Large)"] === "Small").length || 0 },
              { name: "Medium", value: data.filter((d) => d?.["Vendor Size (Small/Medium/Large)"] === "Medium").length || 0 },
              { name: "Large", value: data.filter((d) => d?.["Vendor Size (Small/Medium/Large)"] === "Large").length || 0 },
            ]}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#3182CE" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 📊 Customer Ratings Bar Chart */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-lg font-semibold text-center mb-2">
          Customer Ratings (1-5 Stars)
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={customerRatingsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#38A169" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 📊 Average Customer Ratings Per Vendor */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-lg font-semibold text-center mb-2">
          Average Customer Rating per Vendor
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={avgCustomerRatings}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-30} textAnchor="end" height={80} />
            <YAxis domain={[0, 5]} tickCount={6} />
            <Tooltip />
            <Legend />
            <Bar dataKey="averageRating" fill="#FF8C00" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
