import React from 'react';

const DataFormatGuidelines = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-3">CSV Format</h3>
        <p className="text-gray-400 mb-4">
          Your CSV file should have the following headers:
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left border border-gray-700">Column</th>
                <th className="px-4 py-2 text-left border border-gray-700">Description</th>
                <th className="px-4 py-2 text-left border border-gray-700">Required</th>
                <th className="px-4 py-2 text-left border border-gray-700">Example</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-2 border border-gray-700 font-medium">name</td>
                <td className="px-4 py-2 border border-gray-700">Full name of the lead</td>
                <td className="px-4 py-2 border border-gray-700 text-status-green">Yes</td>
                <td className="px-4 py-2 border border-gray-700">John Smith</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border border-gray-700 font-medium">email</td>
                <td className="px-4 py-2 border border-gray-700">Email address</td>
                <td className="px-4 py-2 border border-gray-700 text-status-green">Yes</td>
                <td className="px-4 py-2 border border-gray-700">john@example.com</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border border-gray-700 font-medium">phone</td>
                <td className="px-4 py-2 border border-gray-700">Phone number</td>
                <td className="px-4 py-2 border border-gray-700 text-status-yellow">No</td>
                <td className="px-4 py-2 border border-gray-700">+1 555 123 4567</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border border-gray-700 font-medium">company</td>
                <td className="px-4 py-2 border border-gray-700">Company name</td>
                <td className="px-4 py-2 border border-gray-700 text-status-yellow">No</td>
                <td className="px-4 py-2 border border-gray-700">Acme Inc</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border border-gray-700 font-medium">source</td>
                <td className="px-4 py-2 border border-gray-700">Lead source</td>
                <td className="px-4 py-2 border border-gray-700 text-status-yellow">No</td>
                <td className="px-4 py-2 border border-gray-700">Website</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border border-gray-700 font-medium">value</td>
                <td className="px-4 py-2 border border-gray-700">Estimated value</td>
                <td className="px-4 py-2 border border-gray-700 text-status-yellow">No</td>
                <td className="px-4 py-2 border border-gray-700">10000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-3">JSON Format</h3>
        <p className="text-gray-400 mb-4">
          Your JSON file should contain an array of lead objects with the following structure:
        </p>
        <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
          <pre className="text-sm text-gray-300">
{`[
  {
    "name": "John Smith",
    "email": "john@example.com",
    "phone": "+1 555 123 4567",
    "company": "Acme Inc",
    "source": "Website",
    "value": 10000
  },
  ...
]`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default DataFormatGuidelines; 