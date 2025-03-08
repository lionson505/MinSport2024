import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Button } from "./ui/Button";
import { Input } from "./ui/input";
import { useTheme } from "../context/ThemeContext";
import { X } from "lucide-react";
import { locations } from "../data/locations";

function AddMassSportModal({ isOpen, onClose, onAdd, sport }) {
  const { isDarkMode } = useTheme();

  const [formData, setFormData] = useState({
    date: "",
    province: "",
    district: "",
    sector: "",
    cell: "",
    village: "",
    rounds: 0,
    purposeTheam: "",
    numberFemaleParticipants: 0,
    numberMaleParticipants: 0,
    totalParticipants: 0,
    organisers: "",
    guestOfHonor: ""
  });

  useEffect(() => {
    if (sport) {
      setFormData(sport);
    } else {
      setFormData({
        date: "",
        province: "",
        district: "",
        sector: "",
        cell: "",
        village: "",
        rounds: 0,
        purposeTheam: "",
        numberFemaleParticipants: 0,
        numberMaleParticipants: 0,
        totalParticipants: 0,
        organisers: "",
        guestOfHonor: ""
      });
    }
  }, [sport]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: name.includes("number") || name === "rounds" ? parseInt(value, 10) || 0 : value,
      };
      
      if (name === "numberFemaleParticipants" || name === "numberMaleParticipants") {
        newData.totalParticipants = (name === "numberFemaleParticipants" ? parseInt(value, 10) || 0 : prev.numberFemaleParticipants) +
                                   (name === "numberMaleParticipants" ? parseInt(value, 10) || 0 : prev.numberMaleParticipants);
      }
      
      return newData;
    });
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Reset dependent fields
      ...(name === "province" && { district: "", sector: "", cell: "", village: "" }),
      ...(name === "district" && { sector: "", cell: "", village: "" }),
      ...(name === "sector" && { cell: "", village: "" }),
      ...(name === "cell" && { village: "" }),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
    onClose();
  };

  const getDistricts = () => {
    return locations.districts[formData.province] || [];
  };

  const getSectors = () => {
    return locations.sectors[formData.district] || [];
  };

  const getCells = () => {
    return locations.cells[formData.sector] || [];
  };

  const getVillages = () => {
    return locations.villages[formData.cell] || [];
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={`w-full max-w-2xl transform overflow-hidden rounded-lg ${
                  isDarkMode ? "bg-gray-900 text-white" : "bg-white"
                } shadow-lg p-8 text-left transition-all`}
              >
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title className="text-xl font-semibold">
                    {sport ? "Edit Mass Sport Event" : "Add New Mass Sport Event"}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Date</label>
                      <Input type="date" name="date" value={formData.date} onChange={handleChange} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Province</label>
                      <select
                        name="province"
                        value={formData.province}
                        onChange={handleLocationChange}
                        className="w-full border rounded-lg px-3 py-2"
                        required
                      >
                        <option value="">Select Province</option>
                        {locations.provinces.map((province) => (
                          <option key={province} value={province}>
                            {province}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">District</label>
                      <select
                        name="district"
                        value={formData.district}
                        onChange={handleLocationChange}
                        className="w-full border rounded-lg px-3 py-2"
                        required
                      >
                        <option value="">Select District</option>
                        {getDistricts().map((district) => (
                          <option key={district} value={district}>
                            {district}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Sector</label>
                      <select
                        name="sector"
                        value={formData.sector}
                        onChange={handleLocationChange}
                        className="w-full border rounded-lg px-3 py-2"
                        required
                      >
                        <option value="">Select Sector</option>
                        {getSectors().map((sector) => (
                          <option key={sector} value={sector}>
                            {sector}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Cell</label>
                      <select
                        name="cell"
                        value={formData.cell}
                        onChange={handleLocationChange}
                        className="w-full border rounded-lg px-3 py-2"
                        required
                      >
                        <option value="">Select Cell</option>
                        {getCells().map((cell) => (
                          <option key={cell} value={cell}>
                            {cell}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Village</label>
                      <select
                        name="village"
                        value={formData.village}
                        onChange={handleLocationChange}
                        className="w-full border rounded-lg px-3 py-2"
                        required
                      >
                        <option value="">Select Village</option>
                        {getVillages().map((village) => (
                          <option key={village} value={village}>
                            {village}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Rounds</label>
                    <Input type="number" name="rounds" value={formData.rounds} onChange={handleChange} min="1" required />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Purpose/Theme</label>
                    <Input type="text" name="purposeTheam" value={formData.purposeTheam} onChange={handleChange} required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Female Participants</label>
                      <Input
                        type="number"
                        name="numberFemaleParticipants"
                        value={formData.numberFemaleParticipants}
                        onChange={handleChange}
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Male Participants</label>
                      <Input
                        type="number"
                        name="numberMaleParticipants"
                        value={formData.numberMaleParticipants}
                        onChange={handleChange}
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Organisers</label>
                    <Input type="text" name="organisers" value={formData.organisers} onChange={handleChange} required />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Guest of Honor</label>
                    <Input type="text" name="guestOfHonor" value={formData.guestOfHonor} onChange={handleChange} />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button type="button" variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type="submit">{sport ? "Save Changes" : "Add Event"}</Button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default AddMassSportModal;
