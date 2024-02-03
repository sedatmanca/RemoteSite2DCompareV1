$(function(){
    // To add new datasets:
    // 1. Add the necessary folders in the repository
    // 2. Add the proper entries below


    //Replace lat1, lon1, lat2, and lon2 with the latitude and longitude coordinates 
    //of the top-left and bottom-right corners of each orthophoto, respectively
    //It must be coming from dataset, from selected project
    var lat1 = 44.34780004196622;
    var lon1 = 26.23003111169812;
    var lat2 = 44.34801852842442;
    var lon2 = 26.23089349708368;
    var lat3 = 44.37926299000853;
    var lon3 = 26.24474373844291;
    var lat4 = 44.37937075455216;
    var lon4 = 26.24436140332963;
    var lat5 = 44.32815352107797;
    var lon5 = 26.13445952363111;
    var lat6 = 44.32780288338909;
    var lon6 = 26.13250176776592;

    //Project Selection
    //It must be connected to database
    var datasets = [
        {
            id: '52+070.00+km+to+56+300.00 (4.230+meters)',
            label: "52+070.00 km to 56+300.00 (4.230 meters)",
            center: [(lat3 + lat4) / 2, (lon3 + lon4) / 2]
        } ,
        {
            id: '56+300.00 to 61+000.00 (5.700 meters)',
            label: "56+300.00 to 61+000.00 (5.700 meters)",
            center: [(lat1 + lat2) / 2, (lon1 + lon2) / 2]
        } ,  
        {
            id: '61+000.00 to 69+000.00 (8.000 meters)',
            label: "61+000.00 to 69+000.00 (8.000 meters)",
            center: [(lat5 + lat6) / 2, (lon5 + lon6) / 2]
        } ,
      

    ];


    //Date selection
    //When project is selected, the dates are coming with arrays, in the array only the dates when the project model is created included
    //The code below will replace with array
    var dates = [
        {
            id: "11.10.2023",
            label: "52+070-56+300-October/2023"
        },
        {
            id: "06.11.2023",
            label: "52+070-56+300-November/2023"
        },
        {
            id: "06.10.2023",
            label: "56+300-61+000-October/2023"
        },
        {
            id: "07.11.2023",
            label: "56+300-61+000-November/2023"
        },
        {
            id: "10.10.2023",
            label: "61+000-69+000-October/2023"
        },
        {
            id: "16.11.2023",
            label: "61+000-69+000-November/2023"
        },

    ]

    //Map definitions
    var map = L.map('map', {
        zoom: 20,
        center: datasets[0].center //The center of the orthopohoto and dsm model, it is coming lan  & lon variables
    });

    //Add Base Map Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 99,
        maxNativeZoom: 19,
    }).addTo(map);


    // Populate datasets
    var $dataset = $("#dataset");
    $dataset.on('change', function(e){
        updateLayers();
        centerOnLayer();
    });
    
    //Show datasets as array for selection
    for (var i in datasets){
        var d = datasets[i];
        var $opt = $('<option value="' + d.id + '">' + d.label + '</option>');
        
        $dataset.append($opt);
    }

    // Populate dates
    var $leftEngine = $("#leftEngine");
    $leftEngine.on('change', function(e){
        if ($(this).val() !== $rightEngine.val()){
            updateLayers();
        }else{
            var dtId = null;
            for (var k in dates){
                if (dates[k].id !== $rightEngine.val()){
                    dtId = dates[k].id;
                    break;
                }
            }
            $(this).val(dtId);
            updateLayers();
        }
    });
    var $rightEngine = $("#rightEngine");
    $rightEngine.on('change', function(e){
        if ($(this).val() !== $leftEngine.val()){
            updateLayers();
        }else{
            var dtId = null;
            for (var k in dates){
                if (dates[k].id !== $leftEngine.val()){
                    dtId = dates[k].id;
                    break;
                }
            }
            $(this).val(dtId);
            updateLayers();
        }
    });
    
    for (var i in dates){
        var e = dates[i];
        var $opt = $('<option value="' + e.id + '"' + (e.rightStart ? 'selected' : '') + '>' + e.label + '</option>');
        $rightEngine.append($opt);
        
        $opt = $('<option value="' + e.id + '"' + (e.leftStart ? 'selected' : '') + '>' + e.label + '</option>');
        $leftEngine.append($opt);
    }

    var $product = $("#product");
    $product.on("change", function(){
        updateLayers();
    });

    // Create layers
    var layers = {};
    $leftEngine.children().each(function(){
        var dateId = $(this).val();
        $dataset.children().each(function(){
            var datasetId = $(this).val();

            $product.children().each(function(){
                var productId = $(this).val();

                var prefix = "/";

                layers[dateId + '|' + datasetId + '|' + productId] = L.tileLayer(prefix + 'https://costumersdata.s3.eu-west-1.amazonaws.com/data/' + datasetId +'/' + dateId + '/' + productId + '/tiles/{z}/{x}/{y}.png', {
                    noWrap: true,
                    maxZoom: 99,
                    maxNativeZoom: 21,
                    tms: true
                });
            });
        });
    });

    var sideBySide = L.control.sideBySide([], []).addTo(map);

    //Add layers to map
    var updateLayers = function(){
        for (var k in layers){
            map.removeLayer(layers[k]);
        }
        
        var leftLayer = layers[$leftEngine.val() + '|' + $dataset.val() + '|' + $product.val()];
        var rightLayer = layers[$rightEngine.val() + '|' + $dataset.val() + '|' + $product.val()];
        
        if (leftLayer){
            leftLayer.addTo(map);
            sideBySide.setLeftLayers([leftLayer]);
        }else{
            sideBySide.setLeftLayers([]);
        }

        if (rightLayer){
            rightLayer.addTo(map);
            sideBySide.setRightLayers([rightLayer]);
        }else{
            sideBySide.setRightLayers([]);
        }
    };

    var centerOnLayer = function(){
        for (var k in datasets){
            if (datasets[k].id === $dataset.val()){
                map.panTo(datasets[k].center);
                break;
            }
        }
    };

    updateLayers();
    centerOnLayer();

});
