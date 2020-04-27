const generalLabelDetection = async (photoPath) => {
    return new Promise(async(resolve, reject) => {
        try {
            // Imports the Google Cloud client library
            const vision = require('@google-cloud/vision');

            //console.log(vision)

            const client = new vision.ImageAnnotatorClient({
                keyFilename: "api-key.json"
            });

            //console.log(client)
          
            // Performs label detection on the image file
            //could use webDetection instead of labelDetection, but google vision cannot access fb cdn.
            const [result] = await client.labelDetection(photoPath);
            
            const labels = result.labelAnnotations
        
            const arrayLabels = [];
        
            labels.forEach((obj) => {
                console.log(obj);
                arrayLabels.push({
                    label: obj.description,
                    score: obj.score

                });
            });
        
            resolve(arrayLabels)
        } catch (error) {
            reject(error)
        }
    })
}

const landmarkDetection = async (photoPath) => {
    return new Promise(async(resolve, reject) => {
        try {
            const vision = require('@google-cloud/vision');

            const client = new vision.ImageAnnotatorClient({
                keyFilename: "api-key.json"
            });

            const [result] = await client.landmarkDetection(photoPath);
            
            const labels = result.landmarkAnnotations
        
            const arrayLabels = [];
        
            labels.forEach((obj) => {
                console.log(obj);
                arrayLabels.push({
                    label: obj.description,
                    score: obj.score,
                    location: obj.locations[0].latLng,
                    vertices: obj.boundingPoly.vertices
                })

                if(obj.boundingPoly.vertices) {
                    for (vertex of obj.boundingPoly.vertices) {
                        console.log(vertex)
                    }
                }
            });
        

            resolve(arrayLabels)
        } catch (error) {
            reject(error)
        }
    })
}


/**
 * DO NOT USE FOR FOOD
 * 
 */
const objectDetection = async (photoPath) => {
    return new Promise(async(resolve, reject) => {
        try {
            const vision = require('@google-cloud/vision');

            const client = new vision.ImageAnnotatorClient({
                keyFilename: "api-key.json"
            });

            const [result] = await client.objectLocalization(photoPath);
            
            const labels = result.localizedObjectAnnotations
        
            const arrayLabels = [];
        
            labels.forEach((obj) => {
                console.log(obj);
                arrayLabels.push({
                    label: obj.name,
                    score: obj.score,
                    vertices: obj.boundingPoly.normalizedVertices
                })

                if(obj.boundingPoly.normalizedVertices) {
                    for (vertex of obj.boundingPoly.normalizedVertices) {
                        console.log(vertex)
                    }
                }
            });
        

            resolve(arrayLabels)
        } catch (error) {
            reject(error)
        }
    })
}

module.export = {
    generalLabelDetection,
    landmarkDetection,
    objectDetection
}

const visionStart = async () => {
    const result = await generalLabelDetection('./vision-images/annalena-coffee-cream.jpg')
    console.log(result)
}

visionStart()





/**
 * GENERAL LABEL DETECTION
 * 
 * own images:
 * raisu-taishoku = [
  { label: 'Dish',          score: 0.9934034943580627 },
  { label: 'Food',          score: 0.9903261065483093 },
  { label: 'Cuisine',       score: 0.9864208102226257 },
  { label: 'Meal',          score: 0.9745010733604431 },
  { label: 'Ingredient',    score: 0.9207317233085632 },
  { label: 'Lunch',         score: 0.9045572280883789 },
  { label: 'Brunch',        score: 0.8725035190582275 },
  { label: 'Comfort food',  score: 0.8364213109016418 },
  { label: 'Side dish',     score: 0.7885571718215942 },
  { label: 'Steamed rice',  score: 0.7318893671035767 }
]

* elsantos-cocktails = [
  { label: 'Drink',                 score: 0.9074549078941345 },
  { label: 'Alcohol',               score: 0.8673948645591736 },
  { label: 'Alcoholic beverage',    score: 0.7993856072425842 },
  { label: 'Liqueur',               score: 0.7360434532165527 },
  { label: 'Distilled beverage',    score: 0.7072606682777405 },
  { label: 'Wine glass',            score: 0.6176615953445435 },
  { label: 'Stemware',              score: 0.6022536158561707 },
  { label: 'Beer',                  score: 0.5740253329277039 },
  { label: 'Wine',                  score: 0.5525267124176025 },
  { label: 'Glass',                 score: 0.53797447681427 }
]

* madeon-concert = [
  { label: 'Stage',         score: 0.9531477093696594 },
  { label: 'Pink',          score: 0.9458781480789185 },
  { label: 'Light',         score: 0.9118257164955139 },
  { label: 'Magenta',       score: 0.8990402221679688 },
  { label: 'Lighting',      score: 0.8569766879081726 },
  { label: 'Purple',        score: 0.8480851650238037 },
  { label: 'Architecture',  score: 0.817379355430603 },
  { label: 'Performance',   score: 0.8111386895179749 },
  { label: 'Night',         score: 0.7608978152275085 },
  { label: 'Music venue',   score: 0.7211454510688782 }
]

* annalena-coffee-cream = [
  { label: 'Cup',            score: 0.9596391320228577 },
  { label: 'Cup',            score: 0.931665301322937 },
  { label: 'Coffee cup',     score: 0.9285848736763 },
  { label: 'Caffeine',       score: 0.9179466366767883 },
  { label: 'Coffee',         score: 0.9091404676437378 },
  { label: 'Café au lait',   score: 0.8989247679710388 },
  { label: 'Drink',          score: 0.8886078596115112 },
  { label: 'Cuban espresso', score: 0.8766772747039795 },
  { label: 'Espresso',       score: 0.8371198177337646 },
  { label: 'Serveware',      score: 0.8196627497673035 }
]




* pixabay images:
* eiffel-tower = [
  { label: 'Landmark',                      score: 0.9801180362701416 },
  { label: 'Tower',                         score: 0.9758491516113281 },
  { label: 'Sky',                           score: 0.9735233783721924 },
  { label: 'Spire',                         score: 0.9347425103187561 },
  { label: 'Cloud',                         score: 0.9149162173271179 },
  { label: 'Architecture',                  score: 0.8785452842712402 },
  { label: 'Monument',                      score: 0.7835369110107422 },
  { label: 'Tourist attraction',            score: 0.7294856309890747 },
  { label: 'National historic landmark',    score: 0.7191091179847717 },
  { label: 'Steeple',                       score: 0.7149982452392578 }
]

* shibuya-crossing = [
  { label: 'Metropolitan area',     score: 0.9542924165725708 },
  { label: 'People',                score: 0.9515836238861084 },
  { label: 'Crowd',                 score: 0.9488330483436584 },
  { label: 'Pedestrian',            score: 0.9258671998977661 },
  { label: 'City',                  score: 0.9087972640991211 },
  { label: 'Metropolis',            score: 0.8857178688049316 },
  { label: 'Human settlement',      score: 0.8735724687576294 },
  { label: 'Urban area',            score: 0.8657515645027161 },
  { label: 'Building',              score: 0.817916750907898 },
  { label: 'Street',                score: 0.802182137966156 }
]

* fushimi-inari-base-shrine = [
  { label: 'Chinese architecture',  score: 0.9933652877807617 },
  { label: 'Japanese architecture', score: 0.9828251600265503 },
  { label: 'Place of worship',      score: 0.9542867541313171 },
  { label: 'Shinto shrine',         score: 0.9481294751167297 },
  { label: 'Temple',                score: 0.9400829672813416 },
  { label: 'Shrine',                score: 0.9243102073669434 },
  { label: 'Architecture',          score: 0.922527551651001 },
  { label: 'Building',              score: 0.8979781270027161 },
  { label: 'Historic site',         score: 0.8254184126853943 },
  { label: 'Leisure',               score: 0.808641791343689 }
]

* hawaii-oahu-beach = [
  { label: 'Beach',         score: 0.9879257678985596 },
  { label: 'Body of water', score: 0.9841179251670837 },
  { label: 'Sky',           score: 0.9550930857658386 },
  { label: 'Sand',          score: 0.9423789381980896 },
  { label: 'Sea',           score: 0.9305276274681091 },
  { label: 'Ocean',         score: 0.9298623204231262 },
  { label: 'Coast',         score: 0.9221044778823853 },
  { label: 'Shore',         score: 0.919410765171051 },
  { label: 'Vacation',      score: 0.918220579624176 },
  { label: 'Tourism',       score: 0.8895744681358337 }
]

 * lasvegas-venetian-canals = [
  { label: 'Gondola',               score: 0.9823901653289795 },
  { label: 'Waterway',              score: 0.9578036069869995 },
  { label: 'Water transportation',  score: 0.9489790201187134 },
  { label: 'Boat',                  score: 0.943118155002594 },
  { label: 'Vehicle',               score: 0.8956539630889893 },
  { label: 'Canal',                 score: 0.8442650437355042 },
  { label: 'Watercraft',            score: 0.8360485434532166 },
  { label: 'Building',              score: 0.834876537322998 },
  { label: 'Architecture',          score: 0.817379355430603 },
  { label: 'Water',                 score: 0.8073040843009949 }
]

 */



 /**
  * LANDMARK DETECTION
  * 
  * pixabay images:
  * eiffel-tower = [
  {
    label: 'Eiffel Tower',
    score: 0.8600269556045532,
    location: { latitude: 48.858461, longitude: 2.294351 },
    vertices: [ [Object], [Object], [Object], [Object] ]
  },
  {
    label: 'Trocadéro Gardens',
    score: 0.8184162378311157,
    location: { latitude: 48.861596299999995, longitude: 2.2892823 },
    vertices: [ [Object], [Object], [Object], [Object] ]
  }
]

  * shibuya-crossing = [
  {
    label: 'Hachikō Memorial Statue',
    score: 0.3928065001964569,
    location: { latitude: 35.6590537, longitude: 139.70055779999998 },
    vertices: [ [Object], [Object], [Object], [Object] ]
  },
  {
    label: 'Shibuya',
    score: 0.37842270731925964,
    location: { latitude: 35.65942867113515, longitude: 139.700569 },
    vertices: [ [Object], [Object], [Object], [Object] ]
  }
]


  * fushimi-inari-base-shrine = [
  {
    label: 'Fushimi Inari Taisha',
    score: 0.9037169218063354,
    location: { latitude: 34.967140199999996, longitude: 135.7726717 },
    vertices: [ [Object], [Object], [Object], [Object] ]
  },
  {
    label: 'Fushimi Inari-Taisha',
    score: 0.7947907447814941,
    location: { latitude: 34.967139, longitude: 135.77301 },
    vertices: [ [Object], [Object], [Object], [Object] ]
  }
]

  * hawaii-oahu-beach = []   //no detection, returns empty array


  * lasvegas-venetian-canals = [
  {
    label: 'The Venetian',
    score: 0.8919754028320312,
    location: { latitude: 36.122027, longitude: -115.170407 },
    vertices: [ [Object], [Object], [Object], [Object] ]
  },
  {
    label: 'Las Vegas',
    score: 0.8717468976974487,
    location: { latitude: 36.17307979263565, longitude: -115.13975 },
    vertices: [ [Object], [Object], [Object], [Object] ]
  },
  {
    label: 'The Venetian Las Vegas',
    score: 0.8575116395950317,
    location: { latitude: 36.163361, longitude: -115.146332 },
    vertices: [ [Object], [Object], [Object], [Object] ]
  }
]


  * OBJECT DETECTION
  * own images:
  * elsantos-cocktails = [
  {
    label: 'Tableware',
    score: 0.8152203559875488,
    vertices: [ [Object], [Object], [Object], [Object] ]
  },
  {
    label: 'Tableware',
    score: 0.8054972290992737,
    vertices: [ [Object], [Object], [Object], [Object] ]
  },
  {
    label: 'Tableware',
    score: 0.8023601174354553,
    vertices: [ [Object], [Object], [Object], [Object] ]
  },
  {
    label: 'Tableware',
    score: 0.7717950344085693,
    vertices: [ [Object], [Object], [Object], [Object] ]
  },
  {
    label: 'Tableware',
    score: 0.7588609457015991,
    vertices: [ [Object], [Object], [Object], [Object] ]
  },
  {
    label: 'Tableware',
    score: 0.7585292458534241,
    vertices: [ [Object], [Object], [Object], [Object] ]
  },
  {
    label: 'Tableware',
    score: 0.744032621383667,
    vertices: [ [Object], [Object], [Object], [Object] ]
  },
  {
    label: 'Tableware',
    score: 0.7402792572975159,
    vertices: [ [Object], [Object], [Object], [Object] ]
  },
  {
    label: 'Drink',
    score: 0.6238688230514526,
    vertices: [ [Object], [Object], [Object], [Object] ]
  },
  {
    label: 'Drink',
    score: 0.6234875917434692,
    vertices: [ [Object], [Object], [Object], [Object] ]
  }
]
  * 
  */