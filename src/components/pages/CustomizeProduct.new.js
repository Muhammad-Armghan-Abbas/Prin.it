import React, { useState, useRef, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Stage, Layer, Image as KonvaImage, Transformer } from 'react-konva';
import CartContext from '../Context/CartContext';
import './CustomizeProduct.css';

const CustomizeProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { item, addToCart, updateState } = useContext(CartContext);
  
  // State
  const [product, setProduct] = useState(null);
  const [side, setSide] = useState('front');
  const [baseImage, setBaseImage] = useState(null);
  const [designImage, setDesignImage] = useState(null);
  const [ready, setReady] = useState(false);
  const [imageProps, setImageProps] = useState({
    x: 250,
    y: 300,
    width: 100,
    height: 100,
    rotation: 0,
    scaleX: 1,
    scaleY: 1
  });

  // Refs
  const stageRef = useRef(null);
  const imageRef = useRef(null);
  const transformerRef = useRef(null);

  // Load product
  useEffect(() => {
    const foundProduct = item.find(p => p.id === parseInt(id));
    if (foundProduct) {
      setProduct(foundProduct);
    }
  }, [id, item]);

  // Load base product image
  useEffect(() => {
    if (product?.image) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = product.image;
      img.onload = () => {
        setBaseImage(img);
      };
    }
  }, [product]);

  // Handle transformer initialization
  useEffect(() => {
    if (!ready || !imageRef.current || !transformerRef.current) return;
    
    transformerRef.current.nodes([imageRef.current]);
    transformerRef.current.getLayer().batchDraw();
  }, [ready]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset states
    setReady(false);
    setDesignImage(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target.result;
      
      img.onload = () => {
        // Calculate size maintaining aspect ratio
        const maxSize = 200;
        const ratio = Math.min(maxSize / img.width, maxSize / img.height);
        const width = img.width * ratio;
        const height = img.height * ratio;

        // Set initial position and size
        setImageProps({
          x: 250 - width / 2,
          y: 300 - height / 2,
          width,
          height,
          rotation: 0,
          scaleX: 1,
          scaleY: 1
        });

        setDesignImage(img);
        setReady(true);
      };
    };
    reader.readAsDataURL(file);
  };

  const handleTransform = () => {
    if (!imageRef.current || !transformerRef.current) return;

    const node = imageRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    // Calculate new dimensions
    const width = Math.max(20, Math.min(400, node.width() * scaleX));
    const height = Math.max(20, Math.min(400, node.height() * scaleY));

    // Reset scale and update dimensions
    node.scaleX(1);
    node.scaleY(1);
    
    setImageProps({
      x: node.x(),
      y: node.y(),
      width,
      height,
      rotation: node.rotation(),
      scaleX: 1,
      scaleY: 1
    });
  };

  const handleDone = () => {
    if (!designImage) {
      alert('Please upload an image first');
      return;
    }

    addToCart(id);
    updateState(id);
    navigate('/cart');
  };

  if (!product) return <div>Loading...</div>;

  return (
    <div className="customizer-container">
      <div className="customizer-header">
        <h1>Customize {product.title}</h1>
        <div className="side-selector">
          <button 
            className={side === 'front' ? 'active' : ''} 
            onClick={() => setSide('front')}
          >
            Front
          </button>
          <button 
            className={side === 'back' ? 'active' : ''} 
            onClick={() => setSide('back')}
          >
            Back
          </button>
        </div>
      </div>

      <div className="customizer-main">
        <div className="canvas-container">
          <Stage 
            ref={stageRef}
            width={500} 
            height={600}
          >
            <Layer>
              {baseImage && (
                <KonvaImage
                  image={baseImage}
                  width={500}
                  height={600}
                  opacity={0.7}
                />
              )}
            </Layer>
            <Layer>
              {designImage && ready && (
                <>
                  <KonvaImage
                    ref={imageRef}
                    image={designImage}
                    {...imageProps}
                    draggable
                    onDragEnd={(e) => {
                      setImageProps({
                        ...imageProps,
                        x: e.target.x(),
                        y: e.target.y(),
                      });
                    }}
                    onTransform={handleTransform}
                  />
                  <Transformer
                    ref={transformerRef}
                    boundBoxFunc={(oldBox, newBox) => {
                      const minSize = 20;
                      const maxSize = 400;
                      
                      if (
                        newBox.width < minSize ||
                        newBox.height < minSize ||
                        newBox.width > maxSize ||
                        newBox.height > maxSize
                      ) {
                        return oldBox;
                      }
                      return newBox;
                    }}
                    keepRatio={true}
                    enabledAnchors={[
                      'top-left',
                      'top-right',
                      'bottom-left',
                      'bottom-right'
                    ]}
                  />
                </>
              )}
            </Layer>
          </Stage>
        </div>

        <div className="customizer-controls">
          <div className="upload-section">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="file-input"
            />
            <p className="upload-hint">
              Upload your design (PNG or JPG)
              <br />
              Max size: 5MB
            </p>
          </div>

          <div className="price-section">
            <h3>Base Price: ${product.price}</h3>
            <h3>Customization: $5.00</h3>
            <h2>Total: ${(parseFloat(product.price) + 5).toFixed(2)}</h2>
          </div>

          <button className="done-button" onClick={handleDone}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomizeProduct;
