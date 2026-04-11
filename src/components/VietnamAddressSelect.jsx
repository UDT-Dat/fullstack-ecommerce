import React, { useState, useEffect, useCallback } from "react";

const API_BASE = "https://provinces.open-api.vn/api";

const VietnamAddressSelect = ({
  province = "",
  district = "",
  ward = "",
  onChange,
}) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  
  const [provCode, setProvCode] = useState(null);
  const [distCode, setDistCode] = useState(null);

  const [loadingP, setLoadingP] = useState(false);
  const [loadingD, setLoadingD] = useState(false);
  const [loadingW, setLoadingW] = useState(false);

  // 1. Load provinces
  useEffect(() => {
    setLoadingP(true);
    fetch(`${API_BASE}/p/`)
      .then((r) => r.json())
      .then((data) => setProvinces(data))
      .catch(() => {})
      .finally(() => setLoadingP(false));
  }, []);

  // 2. Resolve province code from name
  useEffect(() => {
    if (!province || provinces.length === 0) {
      setDistricts([]);
      setDistCode(null);
      setWards([]);
      return;
    }
    const found = provinces.find((p) => p.name === province);
    if (found) {
      setProvCode(found.code);
    } else {
      setProvCode(null);
      setDistricts([]);
      setWards([]);
    }
  }, [province, provinces]);

  // 3. Load districts based on province code
  useEffect(() => {
    if (!provCode) return;
    setLoadingD(true);
    fetch(`${API_BASE}/p/${provCode}?depth=2`)
      .then((r) => r.json())
      .then((data) => setDistricts(data.districts || []))
      .catch(() => setDistricts([]))
      .finally(() => setLoadingD(false));
  }, [provCode]);

  // 4. Resolve district code from name
  useEffect(() => {
    if (!district || districts.length === 0) {
      setWards([]);
      setDistCode(null);
      return;
    }
    const found = districts.find((d) => d.name === district);
    if (found) {
      setDistCode(found.code);
    } else {
      setDistCode(null);
      setWards([]);
    }
  }, [district, districts]);

  // 5. Load wards based on district code
  useEffect(() => {
    if (!distCode) return;
    setLoadingW(true);
    fetch(`${API_BASE}/d/${distCode}?depth=2`)
      .then((r) => r.json())
      .then((data) => setWards(data.wards || []))
      .catch(() => setWards([]))
      .finally(() => setLoadingW(false));
  }, [distCode]);

  const handleProvince = useCallback((e) => {
    onChange({ province: e.target.value, district: "", ward: "" });
  }, [onChange]);

  const handleDistrict = useCallback((e) => {
    onChange({ province, district: e.target.value, ward: "" });
  }, [onChange, province]);

  const handleWard = useCallback((e) => {
    onChange({ province, district, ward: e.target.value });
  }, [onChange, province, district]);

  const selectClass = "w-full border border-zinc-200 rounded-xl p-3 bg-zinc-50 outline-none focus:border-amber-500 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div>
        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
          Tỉnh / Thành {loadingP && <span className="normal-case text-amber-500 tracking-normal">(đang tải...)</span>}
        </label>
        <select
          value={province}
          onChange={handleProvince}
          disabled={loadingP}
          className={selectClass}
        >
          <option value="">Chọn Tỉnh...</option>
          {provinces.map((p) => (
            <option key={p.code} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
          Quận / Huyện {loadingD && <span className="normal-case text-amber-500 tracking-normal">(đang tải...)</span>}
        </label>
        <select
          value={district}
          onChange={handleDistrict}
          disabled={!province || loadingD}
          className={selectClass}
        >
          <option value="">Chọn Quận...</option>
          {districts.map((d) => (
            <option key={d.code} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
          Phường / Xã {loadingW && <span className="normal-case text-amber-500 tracking-normal">(đang tải...)</span>}
        </label>
        <select
          value={ward}
          onChange={handleWard}
          disabled={!district || loadingW}
          className={selectClass}
        >
          <option value="">Chọn Phường...</option>
          {wards.map((w) => (
            <option key={w.code} value={w.name}>
              {w.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default VietnamAddressSelect;
