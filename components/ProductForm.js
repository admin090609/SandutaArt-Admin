import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Spinner from "@/components/Spinner";
import { ReactSortable } from "react-sortablejs";

export default function ProductForm({
  _id,
  title: existingTitle,
  description: existingDescription,
  images: existingImages,
  category: assignedCategory,
  properties: assignedProperties,
  options: assignedOptions,
  minWidth: assignedWidth,
  minHeight: assignedHeight,
}) {
  const [title, setTitle] = useState(existingTitle || '');
  const [description, setDescription] = useState(existingDescription || '');
  const [category, setCategory] = useState(assignedCategory || '');
  const [productProperties, setProductProperties] = useState(assignedProperties || {});
  const [images, setImages] = useState(existingImages || []);
  const [goToProducts, setGoToProducts] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [hoveredImageIndex, setHoveredImageIndex] = useState(null);
  const [minWidth, setMinWidth] = useState(assignedWidth || '');
  const [minHeight, setMinHeight] = useState(assignedHeight || '');


  const router = useRouter();
  useEffect(() => {
    axios.get('/api/categories').then(result => {
      setCategories(result.data);
    })
  }, []);
  async function saveProduct(ev) {
    ev.preventDefault();

    const optionsPayload = optionsData.map(({ title, options }) => ({
      title,
      options: options.filter(option => option.trim() !== ''), // Remove empty options
    }));

    const data = {
      title,
      description,
      images,
      category,
      properties: productProperties,
      options: optionsPayload,
      minWidth,
      minHeight,
    };

    if (_id) {
      // Update
      await axios.put('/api/products', { ...data, _id });
    } else {
      // Create
      await axios.post('/api/products', data);
    }
    setGoToProducts(true);
  }

  if (goToProducts) {
    router.push('/');
  }
  async function uploadImages(ev) {
    const files = ev.target?.files;
    if (files?.length > 0) {
      setIsUploading(true);
      const data = new FormData();
      for (const file of files) {
        data.append('file', file);
      }
      const res = await axios.post('/api/upload', data);
      setImages(oldImages => {
        return [...oldImages, ...res.data.links];
      });
      setIsUploading(false);
    }
  }
  function updateImagesOrder(images) {
    setImages(images);
  }
  function setProductProp(propName, value) {
    setProductProperties(prev => {
      const newProductProps = { ...prev };
      newProductProps[propName] = value;
      return newProductProps;
    });
  }

  const propertiesToFill = [];
  if (categories.length > 0 && category) {
    let catInfo = categories.find(({ _id }) => _id === category);
    propertiesToFill.push(...catInfo.properties);
    while (catInfo?.parent?._id) {
      const parentCat = categories.find(({ _id }) => _id === catInfo?.parent?._id);
      propertiesToFill.push(...parentCat.properties);
      catInfo = parentCat;
    }
  }


  const [optionsData, setOptionsData] = useState(
    assignedOptions || [{ title: '', options: [''] }]
  );

  // Function to add a new title with an option
  const addNewTitle = () => {
    setOptionsData(prevData => [
      ...prevData,
      { title: '', options: [''] },
    ]);
  };

  // Function to add a new option for a specific title
  const addNewOption = (titleIndex) => {
    setOptionsData(prevData => {
      const newData = [...prevData];
      newData[titleIndex] = {
        ...newData[titleIndex],
        options: [...newData[titleIndex].options, ''],
      };
      return newData;
    });
  };

  // Function to update the title or option based on the input value
  const updateOptionData = (titleIndex, optionIndex, value, isTitle) => {
    setOptionsData(prevData => {
      const newData = [...prevData];
      if (isTitle) {
        newData[titleIndex] = { ...newData[titleIndex], title: value };
      } else {
        newData[titleIndex].options[optionIndex] = value;
      }
      return newData;
    });
  };

  const deleteTitle = (titleIndex) => {
    setOptionsData((prevData) => {
      const newData = [...prevData];
      newData.splice(titleIndex, 1);
      return newData;
    });
  };

  return (
    <form onSubmit={saveProduct}>
      <label>Denumirea Produsului</label>
      <input
        type="text"
        placeholder="Produsul..."
        value={title}
        onChange={ev => setTitle(ev.target.value)} />
      <hr className="max-w-[90%] mb-2 border-2 rounded-xl items-center justify-center m-auto border-[#B1B1B1]" />
      <label>Categoria</label>
      <br />
      <select value={category}
        onChange={ev => setCategory(ev.target.value)}
        className="border-2 rounded-sm border-gray-400 mb-2">
        <option value="">Necategorizat</option>
        {categories.length > 0 && categories.map(c => (
          <option key={c._id} value={c._id}>{c.name}</option>
        ))}
      </select>
      <hr className="max-w-[90%] mb-2 border-2 rounded-xl items-center justify-center m-auto border-[#B1B1B1]" />
      <label>
        Imagini
      </label>
      <div className="mb-2 flex flex-wrap gap-1">
        <ReactSortable
          list={images}
          className="flex flex-wrap gap-1"
          setList={updateImagesOrder}>
          {!!images?.length && images.map((link, index) => (
            <div key={link} className="h-24 w-24 bg-white shadow-sm rounded-md border border-gray-200 overflow-hidden mr-4 flex" onMouseEnter={() => setHoveredImageIndex(index)}
              onMouseLeave={() => setHoveredImageIndex(null)}>
              <img src={link} alt="" className="rounded-lg w-24 h-24" />
              {hoveredImageIndex === index && (
                <button
                  className="absolute text-white p-[4px] mt-1 ml-1 text-sm z-20"
                  onClick={() => {
                    const updatedImages = [...images];
                    updatedImages.splice(index, 1);
                    setImages(updatedImages);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" style={{ fill: '#ffff' }} width="15" height="15" viewBox="0 0 24 24"><path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z" /></svg>
                </button>
              )}
            </div>
          ))}
        </ReactSortable>
        {
          isUploading && (
            <div className="h-24 flex items-center">
              <Spinner />
            </div>
          )
        }
        <label className="w-24 h-24 cursor-pointer text-center flex flex-col items-center justify-center text-sm gap-1 text-primary rounded-md bg-white shadow-sm border border-primary">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <div className="leading-4">
            Adaugă imagine
          </div>
          <input type="file" onChange={uploadImages} className="hidden" />
        </label>
      </div>
      <hr className="max-w-[90%] mb-2 border-2 rounded-xl items-center justify-center m-auto border-[#B1B1B1]" />
      <label>Rezoluție Minimă Imagini</label><br />
      <label>Width:</label>
      <input
        type="number"
        placeholder="Width"
        value={minWidth}
        onChange={ev => setMinWidth(ev.target.value)}
      />
      <label>Height:</label>
      <input
        type="number"
        placeholder="Height"
        value={minHeight}
        onChange={ev => setMinHeight(ev.target.value)}
      />
      <hr className="max-w-[90%] mb-2 border-2 rounded-xl items-center justify-center m-auto border-[#B1B1B1]" />
      <label>Descriere</label>
      <textarea
        placeholder="Descriere..."
        value={description}
        onChange={ev => setDescription(ev.target.value)}
      /><hr className="max-w-[90%] mb-2 border-2 rounded-xl items-center justify-center m-auto border-[#B1B1B1]" />
      <label>Opțiuni</label>
      {optionsData.map((data, titleIndex) => (
        <div key={titleIndex} className="mb-2">
          <div className="flex items-center mb-2">
            <input
              type="text"
              placeholder="Titlu opțiune"
              value={data.title}
              onChange={(ev) => updateOptionData(titleIndex, 0, ev.target.value, true)}
            />
            <button type="button" className="mb-2 ml-2 btn-primary" onClick={() => deleteTitle(titleIndex)}>
              Șterge
            </button>
          </div>
          {data.options.map((option, optionIndex) => (
            <div key={optionIndex}>
              <input
                type="text"
                placeholder="Opțiune"
                value={option}
                onChange={(ev) => updateOptionData(titleIndex, optionIndex, ev.target.value, false)}
              />
            </div>
          ))}
          <button type="button" className="btn-primary" onClick={() => addNewOption(titleIndex)}>
            Adaugă opțiune
          </button>
        </div>
      ))}
      <button className="btn-primary" type="button" onClick={addNewTitle}>
        Adaugă titlu opțiune
      </button>
      <br/>
      <button
        type="submit"
        className="btn-primary mt-4">
        Salvează
      </button>
    </form >
  );
}