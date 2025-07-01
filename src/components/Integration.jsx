import React, { useState } from "react";
import LinuxTerminal from "./Terminal";

const services = ["Linux", "AWS", "Docker", "Kubernetes"];

const Integration = () => {
    const [selectedService, setSelectedService] = useState("Linux");

    return (
        <div className="flex h-screen font-mono bg-gray-900">
            {/* Sidebar */}
            <div className="w-60 bg-gray-800 text-white p-5">
                <h2 className="text-xl font-bold mb-6">Services</h2>
                {services.map((service) => (
                    <button
                        key={service}
                        className={`block w-full text-left mb-3 p-3 rounded-lg transition-all ${
                            selectedService === service 
                                ? "bg-black-600 transform scale-105" 
                                : "bg-yellow-700 hover:bg-gray-600"
                        }`}
                        onClick={() => setSelectedService(service)}
                    >
                        {service}
                    </button>
                ))}
            </div>

            {/* Terminal Container */}
            <div className="flex-1 flex flex-col p-5">
                <h3 className="text-2xl font-semibold mb-4 text-white">
                    {selectedService} Terminal
                </h3>
                <div className="terminal-wrapper flex-1 bg-black rounded-lg overflow-hidden shadow-2xl">
                    <LinuxTerminal />
                </div>
            </div>
        </div>
    );
};

export default Integration;