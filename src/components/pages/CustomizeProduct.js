import React, { useState, useRef, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Stage, Layer, Image as KonvaImage, Transformer } from 'react-konva';
import CartContext from '../Context/CartContext.js';
import './CustomizeProduct.css';

const CustomizeProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { item, addToCart, updateState } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [side, setSide] = useState('front');
  const [baseImage, setBaseImage] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageReady, setIsImageReady] = useState(false);
  const [isEditMode, setIsEditMode] = useState(true);
  const stageRef = useRef(null);
  const imageRef = useRef(null);
  const transformerRef = useRef(null);
  const [imageProps, setImageProps] = useState({
    x: 250,
    y: 300,
    width: 100,
    height: 100,
    rotation: 0,
    scaleX: 1,
    scaleY: 1
  });

  // Load product base image
  useEffect(() => {
    if (product?.image) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';  // Add crossOrigin attribute
      img.src = product.image;
      img.onload = () => {
        setBaseImage(img);
      };
      img.onerror = () => {
        console.error('Error loading base product image');
      };
    }
  }, [product]);

  useEffect(() => {
    // Find the product from the id
    const foundProduct = item.find(p => p.id === parseInt(id));
    if (foundProduct) {
      setProduct(foundProduct);
    }
  }, [id, item]);  useEffect(() => {
    if (!uploadedImage) {
      if (transformerRef.current) {
        transformerRef.current.nodes([]);
        transformerRef.current.getLayer()?.batchDraw();
      }
      setIsImageReady(false);
      return;
    }

    if (!imageRef.current || !transformerRef.current) {
      return;
    }

    // Update image properties
    imageRef.current.position({ x: imageProps.x, y: imageProps.y });
    imageRef.current.width(imageProps.width);
    imageRef.current.height(imageProps.height);
    imageRef.current.rotation(imageProps.rotation);
    imageRef.current.scale({ x: imageProps.scaleX, y: imageProps.scaleY });

    // Update transformer state
    if (isEditMode) {
      transformerRef.current.nodes([imageRef.current]);
    } else {
      transformerRef.current.nodes([]);
    }
    
    transformerRef.current.getLayer()?.batchDraw();
    setIsImageReady(true);
  }, [uploadedImage, isEditMode, imageProps]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    // Reset states
    setUploadedImage(null);
    setIsImageReady(false);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';  // Add crossOrigin attribute
      img.src = e.target.result;
      img.onload = () => {
        try {
          // Calculate initial dimensions maintaining aspect ratio
          let width = img.width;
          let height = img.height;
          const maxSize = 200;

          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }

          // Set new image properties
          setImageProps({
            x: 250 - width / 2,
            y: 300 - height / 2,
            width,
            height,
            rotation: 0,
          });
          setUploadedImage(img);
        } catch (error) {
          console.error('Error processing image:', error);
          alert('Error processing image. Please try again.');
        }
      };
      img.onerror = () => {
        console.error('Error loading uploaded image');
        alert('Error loading image. Please try a different image.');
      };
    };
    reader.onerror = () => {
      console.error('Error reading file');
      alert('Error reading file. Please try again.');
    };
    reader.readAsDataURL(file);
  };  const handleModeToggle = () => {
    if (!imageRef.current) return;

    // Always capture current state before toggling
    const node = imageRef.current;
    const currentProps = {
      x: node.x(),
      y: node.y(),
      width: Math.max(node.width() * node.scaleX(), 20),
      height: Math.max(node.height() * node.scaleY(), 20),
      rotation: node.rotation(),
      scaleX: 1,
      scaleY: 1
    };

    // First update image properties
    setImageProps(currentProps);
    
    // Then toggle mode in the next frame
    requestAnimationFrame(() => {
      setIsEditMode(!isEditMode);
      if (transformerRef.current) {
        if (!isEditMode) { // switching to edit mode
          transformerRef.current.nodes([imageRef.current]);
        } else { // switching to preview mode
          transformerRef.current.nodes([]);
        }
        transformerRef.current.getLayer()?.batchDraw();
      }
    });
  };

  const handleDone = async () => {
    if (!uploadedImage) {
      alert('Please upload an image first');
      return;
    }

    try {
      // Switch to preview mode before capture
      setIsEditMode(false);
      // Wait for next frame to ensure transformer is hidden
      await new Promise(resolve => requestAnimationFrame(resolve));

      // Create a copy of the stage for capture
      const stage = stageRef.current;
      const dataURL = stage.toDataURL({
        pixelRatio: 1,
        mimeType: 'image/jpeg',
        quality: 0.8,
        imageSmoothingEnabled: true,
      });

      // Create a customized product object with size constraints
      const customizedProduct = {
        ...product,
        customization: {
          designImage: uploadedImage.src,
          previewImage: dataURL,
          position: {
            x: imageProps.x,
            y: imageProps.y,
            width: Math.min(imageProps.width, 300),
            height: Math.min(imageProps.height, 300),
            rotation: imageProps.rotation,
            scaleX: imageProps.scaleX,
            scaleY: imageProps.scaleY
          },
          side: side,
          customizationFee: 5.00
        },
        finalPrice: parseFloat(product.price) + 5.00
      };

      const customProductId = addToCart(customizedProduct);
      updateState(customProductId);
      navigate('/checkout');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('There was an error adding the item to cart. Please try again.');
    }
  };

  if (!product) return <div>Loading...</div>;

  return (
    <div className="customizer-container">
      <div className="customizer-header">
        <h1>Customize {product.title}</h1>
        <div className="controls-row">
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
      </div>

      <div className="customizer-main">
        <div className="canvas-container">
          <Stage width={500} height={600} ref={stageRef}>
            <Layer>
              {/* Base product image layer */}
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
              {/* Uploaded design layer */}
              {uploadedImage && imageProps && (
                <>
                  <KonvaImage
                    ref={imageRef}
                    image={uploadedImage}
                    {...imageProps}
                    draggable={isEditMode}
                    transformsEnabled={isEditMode ? "all" : "position"}
                    onDragStart={() => {
                      if (isEditMode && transformerRef.current) {
                        transformerRef.current.nodes([imageRef.current]);
                        transformerRef.current.getLayer().batchDraw();
                      }
                    }}
                    onTransformEnd={(e) => {
                      const node = e.target;
                      const newProps = {
                        x: node.x(),
                        y: node.y(),
                        width: node.width() * node.scaleX(),
                        height: node.height() * node.scaleY(),
                        rotation: node.rotation(),
                        scaleX: 1, // Reset scale after applying it to width/height
                        scaleY: 1
                      };
                      node.scale({ x: 1, y: 1 }); // Reset scale
                      node.width(newProps.width);
                      node.height(newProps.height);
                      setImageProps(newProps);
                    }}
                    onDragEnd={(e) => {
                      const node = e.target;
                      setImageProps(prev => ({
                        ...prev,
                        x: node.x(),
                        y: node.y(),
                      }));
                      node.getLayer().batchDraw();
                    }}
                  />
                  {isEditMode && (
                    <Transformer
                      ref={transformerRef}
                      boundBoxFunc={(oldBox, newBox) => {
                        // Limit resize
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
                      enabledAnchors={[
                        'top-left',
                        'top-right',
                        'bottom-left',
                        'bottom-right'
                      ]}
                      rotateEnabled={true}
                      keepRatio={false}
                      anchorSize={8}
                      anchorCornerRadius={4}
                      anchorStroke="#666"
                      anchorFill="#fff"
                      borderStroke="#666"
                      borderDash={[4, 4]}
                      rotateAnchorOffset={30}
                    />
                  )}
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
            {uploadedImage && (
              <button 
                className={`mode-toggle ${isEditMode ? 'edit-mode' : 'preview-mode'}`}
                onClick={handleModeToggle}
              >
                {isEditMode ? '👁️ Preview' : '✏️ Edit'}
              </button>
            )}
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