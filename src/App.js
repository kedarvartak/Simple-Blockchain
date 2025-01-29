import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import "./App.css";

function App() {
  const blocksRef = useRef([]);
  const backgroundRef = useRef(null);
  const [blockData, setBlockData] = useState([]);
  const [newBlockData, setNewBlockData] = useState("");
  const [isCalculatingHash, setIsCalculatingHash] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const [chainStatus, setChainStatus] = useState({ valid: true, message: "Chain is valid" });

  const calculateHash = async (block) => {
    const blockString = `${block.id}${block.timestamp}${block.data}${block.previousHash}`;
    const msgBuffer = new TextEncoder().encode(blockString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  };

  const validateChain = async (blocks) => {
    for (let i = 1; i < blocks.length; i++) {
      const currentBlock = blocks[i];
      const previousBlock = blocks[i - 1];

      if (currentBlock.previousHash !== previousBlock.hash) {
        return {
          valid: false,
          message: `Invalid link between blocks ${previousBlock.id} and ${currentBlock.id}`
        };
      }

      const calculatedHash = await calculateHash(currentBlock);
      if (calculatedHash !== currentBlock.hash) {
        return {
          valid: false,
          message: `Block ${currentBlock.id} has been tampered with`
        };
      }
    }
    return { valid: true, message: "Chain is valid" };
  };

  useEffect(() => {
    const initializeBlockchain = async () => {
      const genesisBlock = {
        id: 1,
        timestamp: "2024-03-20",
        data: "Genesis Block",
        previousHash: "0000000000000000000000000000000000000000000000000000000000000000",
        hash: ""
      };
      genesisBlock.hash = await calculateHash(genesisBlock);
      setBlockData([genesisBlock]);
    };
    initializeBlockchain();
  }, []);

  const updateBlockData = async (blockId, newData) => {
    setIsCalculatingHash(true);
    try {
      const updatedBlocks = [...blockData];
      const blockIndex = updatedBlocks.findIndex(b => b.id === blockId);
      
      updatedBlocks[blockIndex] = {
        ...updatedBlocks[blockIndex],
        data: newData
      };

      for (let i = blockIndex; i < updatedBlocks.length; i++) {
        updatedBlocks[i].hash = await calculateHash(updatedBlocks[i]);
        
        if (i + 1 < updatedBlocks.length) {
          updatedBlocks[i + 1] = {
            ...updatedBlocks[i + 1],
            previousHash: updatedBlocks[i].hash
          };
        }
      }

      setBlockData(updatedBlocks);
      const status = await validateChain(updatedBlocks);
      setChainStatus(status);

      updatedBlocks.forEach((block, index) => {
        if (index >= blockIndex) {
          const blockElement = blocksRef.current[index];
          
          gsap.to(blockElement, {
            x: [-5, 5, -5, 5, 0],
            duration: 0.5,
            ease: "power1.inOut"
          });

          gsap.to(blockElement, {
            borderColor: status.valid ? "#E2E8F0" : "#EF4444",
            duration: 0.3
          });

          const hashElement = blockElement.querySelector('.hash-value');
          if (hashElement) {
            gsap.to(hashElement, {
              backgroundColor: "#FEF3C7",
              duration: 0.3,
              yoyo: true,
              repeat: 1
            });
          }
        }
      });

    } catch (error) {
      console.error("Error updating block:", error);
    } finally {
      setIsCalculatingHash(false);
      setEditingBlock(null);
    }
  };

  const addBlock = async (e) => {
    e.preventDefault();
    setIsCalculatingHash(true);

    try {
      const previousBlock = blockData[blockData.length - 1];
      const newBlock = {
        id: previousBlock.id + 1,
        timestamp: new Date().toISOString().split('T')[0],
        data: newBlockData,
        previousHash: previousBlock.hash,
        hash: ''
      };

      newBlock.hash = await calculateHash(newBlock);
      const updatedBlocks = [...blockData, newBlock];
      setBlockData(updatedBlocks);
      setNewBlockData("");

      const status = await validateChain(updatedBlocks);
      setChainStatus(status);

      setTimeout(() => {
        const newBlockElement = blocksRef.current[blocksRef.current.length - 1];
        gsap.from(newBlockElement, {
          duration: 1,
          scale: 0.5,
          opacity: 0,
          y: 50,
          ease: "back.out(1.7)",
        });
      }, 0);

    } catch (error) {
      console.error("Error adding block:", error);
    } finally {
      setIsCalculatingHash(false);
    }
  };

  useEffect(() => {
    const particles = [];
    const stars = [];
    const nebulas = [];
    
    const particleCount = 50;
    const starCount = 100;
    const nebulaCount = 5;

    for (let i = 0; i < nebulaCount; i++) {
      const nebula = document.createElement('div');
      nebula.className = 'nebula';
      backgroundRef.current.appendChild(nebula);
      nebulas.push(nebula);

      gsap.set(nebula, {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        scale: Math.random() * 4 + 3,
      });

      gsap.to(nebula, {
        duration: Math.random() * 30 + 30,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        repeat: -1,
        ease: "none",
        yoyo: true,
      });

      gsap.to(nebula, {
        duration: Math.random() * 3 + 2,
        opacity: 0.4,
        scale: "+=1",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }

    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      backgroundRef.current.appendChild(star);
      stars.push(star);

      gsap.set(star, {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        scale: Math.random() * 1 + 0.5,
      });

      gsap.to(star, {
        duration: Math.random() * 2 + 1,
        opacity: Math.random() * 0.8 + 0.2,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });

      gsap.to(star, {
        duration: Math.random() * 150 + 100,
        x: "+=100",
        y: "+=100",
        repeat: -1,
        ease: "none",
        yoyo: true,
      });
    }

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      backgroundRef.current.appendChild(particle);
      particles.push(particle);

      gsap.set(particle, {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        scale: Math.random() * 1 + 0.5,
      });

      gsap.to(particle, {
        duration: Math.random() * 20 + 20,
        x: `+=${Math.random() * 300 - 150}`,
        y: `+=${Math.random() * 300 - 150}`,
        repeat: -1,
        ease: "none",
        yoyo: true,
      });

      gsap.to(particle, {
        duration: Math.random() * 3 + 2,
        opacity: 0.4,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });
    }

    return () => {
      [...particles, ...stars, ...nebulas].forEach(element => element.remove());
    };
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-blue-800 text-blue-900 p-8 overflow-hidden relative">
      <div className="absolute inset-0 bg-blue-500/5" />
      
      <div 
        ref={backgroundRef} 
        className="absolute inset-0 pointer-events-none overflow-hidden"
      />

      <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-20 transition-all duration-300 ${
        chainStatus.valid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            chainStatus.valid ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span>{chainStatus.message}</span>
        </div>
      </div>

      <div className="max-w-md mx-auto mb-16 relative z-10">
        <form onSubmit={addBlock} className="space-y-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <h2 className="text-xl text-blue-900 mb-4">Create New Block</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-blue-900 mb-2">Block Data</label>
                <input
                  type="text"
                  value={newBlockData}
                  onChange={(e) => setNewBlockData(e.target.value)}
                  className="w-full p-2 border border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Enter block data..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isCalculatingHash}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors
                         disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {isCalculatingHash ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin mr-2">⚡</span>
                    Calculating Hash...
                  </span>
                ) : (
                  "Add Block"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
          {blockData.map((block, index) => (
            <div key={block.id} className="relative">
              {index !== 0 && (
                <div
                  id={`connection-${index}`}
                  className="hidden md:flex absolute left-0 top-1/2 w-8 -translate-x-8 items-center"
                >
                  <div className={`h-0.5 w-full transition-colors duration-300 ${
                    chainStatus.valid ? 'bg-blue-400' : 'bg-red-400'
                  }`} />
                  <div className={`absolute -right-1 w-2 h-2 rounded-full transition-colors duration-300 ${
                    chainStatus.valid ? 'bg-blue-500' : 'bg-red-500'
                  }`} />
                </div>
              )}
              
              <div
                ref={(el) => (blocksRef.current[index] = el)}
                className={`w-96 p-8 bg-white/95 backdrop-blur-sm rounded-xl border 
                          shadow-lg transition-all duration-300 ${
                            chainStatus.valid ? 'border-blue-200' : 'border-red-400'
                          }`}
              >
                <div className="mb-6 flex justify-between items-center">
                  <span className="text-xl text-blue-900">Block {block.id}</span>
                  <span className={`px-3 py-1 rounded-full text-sm transition-colors duration-300 ${
                    chainStatus.valid ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'
                  }`}>
                    #{block.hash.substring(0, 8)}...
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="bg-white p-3 rounded-lg border border-blue-100">
                    <span className="text-blue-600">Timestamp: </span>
                    <span className="text-sm">{block.timestamp}</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-blue-100">
                    <span className="text-blue-600">Data: </span>
                    {editingBlock === block.id ? (
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          defaultValue={block.data}
                          className="flex-1 text-sm border rounded px-2 py-1"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updateBlockData(block.id, e.target.value);
                            }
                          }}
                          onBlur={(e) => {
                            updateBlockData(block.id, e.target.value);
                          }}
                        />
                        <button
                          onClick={() => setEditingBlock(null)}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{block.data}</span>
                        <button
                          onClick={() => setEditingBlock(block.id)}
                          className="text-xs text-blue-500 hover:text-blue-700"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-blue-100">
                    <span className="text-blue-600">Previous Hash: </span>
                    <span className="text-sm font-mono text-blue-800">
                      {block.previousHash.substring(0, 8)}...
                      <span className="text-xs text-blue-400 ml-1 cursor-pointer hover:text-blue-600" 
                            title={block.previousHash}>
                        (view full)
                      </span>
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-blue-100">
                    <span className="text-blue-600">Hash: </span>
                    <span className="hash-value text-sm font-mono text-blue-800">
                      {block.hash.substring(0, 8)}...
                      <span className="text-xs text-blue-400 ml-1 cursor-pointer hover:text-blue-600" 
                            title={block.hash}>
                        (view full)
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default App;