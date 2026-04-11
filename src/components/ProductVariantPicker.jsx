import React, { useState, useEffect } from 'react';

const ProductVariantPicker = ({ product, onConfirm, onClose }) => {
    const hasSizes = product.sizes && product.sizes.length > 0;
    const hasOptions = product.options && product.options.length > 0;

    const [selectedSize, setSelectedSize] = useState(hasSizes ? product.sizes[0].label : '');
    const [sizeExtraPrice, setSizeExtraPrice] = useState(hasSizes ? product.sizes[0].extraPrice : 0);
    const [selectedOptions, setSelectedOptions] = useState(() => {
        const init = {};
        if (product.options) {
            product.options.forEach(group => {
                init[group.name] = group.defaultChoice || group.choices[0] || '';
            });
        }
        return init;
    });
    const [quantity, setQuantity] = useState(1);

    const finalPrice = product.price + sizeExtraPrice;
    const totalPrice = finalPrice * quantity;

    const handleSizeSelect = (s) => {
        setSelectedSize(s.label);
        setSizeExtraPrice(s.extraPrice || 0);
    };

    const handleOptionSelect = (groupName, choice) => {
        setSelectedOptions(prev => ({ ...prev, [groupName]: choice }));
    };

    const handleConfirm = () => {
        onConfirm({
            size: selectedSize,
            extraPrice: sizeExtraPrice,
            selectedOptions,
            quantity,
        });
    };

    // Close on Escape key
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center px-0 sm:px-4">
            <div className="absolute inset-0 bg-zinc-950/70 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-100">
                    <div className="flex items-center gap-4">
                        <img src={product.image} alt={product.title} className="w-14 h-14 object-cover rounded-2xl border border-zinc-100 bg-zinc-50" />
                        <div>
                            <h3 className="font-headline font-black text-lg text-zinc-900 leading-tight">{product.title}</h3>
                            <p className="text-amber-600 font-black text-base">{finalPrice.toLocaleString()}đ</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors shrink-0">
                        <span className="material-symbols-outlined text-[18px] text-zinc-500">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
                    {/* Size selector */}
                    {hasSizes && (
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-3">Chọn kích cỡ</p>
                            <div className="flex flex-wrap gap-2">
                                {product.sizes.map(s => (
                                    <button
                                        key={s.label}
                                        onClick={() => handleSizeSelect(s)}
                                        className={`flex flex-col items-center px-5 py-2.5 rounded-xl border-2 font-bold text-sm transition-all ${
                                            selectedSize === s.label
                                                ? 'border-amber-500 bg-amber-50 text-amber-700'
                                                : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
                                        }`}
                                    >
                                        <span className="text-base font-black">{s.label}</span>
                                        <span className="text-[10px] font-bold text-zinc-400 mt-0.5">
                                            {s.extraPrice > 0 ? `+${s.extraPrice.toLocaleString()}đ` : '0đ'}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Option groups (sugar/ice/etc) */}
                    {hasOptions && product.options.map(group => (
                        <div key={group.name}>
                            <p className="text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-3">{group.name}</p>
                            <div className="flex flex-wrap gap-2">
                                {group.choices.map(choice => (
                                    <button
                                        key={choice}
                                        onClick={() => handleOptionSelect(group.name, choice)}
                                        className={`px-4 py-2 rounded-xl border-2 font-bold text-sm transition-all ${
                                            selectedOptions[group.name] === choice
                                                ? 'border-zinc-800 bg-zinc-900 text-white'
                                                : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
                                        }`}
                                    >
                                        {choice}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Quantity */}
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-3">Số lượng</p>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                className="w-10 h-10 rounded-xl border-2 border-zinc-200 flex items-center justify-center font-black text-zinc-700 hover:border-zinc-400 transition-colors"
                            >−</button>
                            <span className="w-10 text-center font-black text-xl text-zinc-900">{quantity}</span>
                            <button
                                onClick={() => setQuantity(q => q + 1)}
                                className="w-10 h-10 rounded-xl border-2 border-zinc-200 flex items-center justify-center font-black text-zinc-700 hover:border-zinc-400 transition-colors"
                            >+</button>
                        </div>
                    </div>
                </div>

                {/* Footer CTA */}
                <div className="px-6 py-5 border-t border-zinc-100 bg-white">
                    <button
                        onClick={handleConfirm}
                        className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-900 font-black py-4 rounded-2xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-3 text-sm tracking-wide"
                    >
                        <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                        Thêm vào giỏ — {totalPrice.toLocaleString()}đ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductVariantPicker;
