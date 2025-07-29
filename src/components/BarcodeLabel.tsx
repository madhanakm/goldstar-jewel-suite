import React from 'react';

interface JewelryItem {
  id: string;
  name: string;
  weight: string;
  purity: string;
  price: string;
}

interface BarcodeLabelProps {
  item: JewelryItem;
  barcodeData: string;
}

export const BarcodeLabel: React.FC<BarcodeLabelProps> = ({ item, barcodeData }) => {
  return (
    <div className="bg-white p-4 border border-gray-300 w-80 mx-auto print:shadow-none">
      <div className="text-center mb-2">
        <h3 className="font-bold text-lg">SRI CASHWAY</h3>
      </div>
      
      <div className="mb-3">
        <div className="text-sm font-semibold">{item.name}</div>
        <div className="text-xs text-gray-600">ID: {item.id}</div>
      </div>
      
      <div className="flex justify-center mb-3">
        <img src={barcodeData} alt={`Barcode for ${item.id}`} className="max-w-full" />
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="font-semibold">Weight:</span> {item.weight}g
        </div>
        <div>
          <span className="font-semibold">Purity:</span> {item.purity}
        </div>
        <div className="col-span-2">
          <span className="font-semibold">Price:</span> ₹{item.price}
        </div>
      </div>
    </div>
  );
};