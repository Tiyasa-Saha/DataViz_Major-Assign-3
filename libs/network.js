
function simulate(data,svg)
{
    let width = parseInt(svg.attr("viewBox").split(' ')[2])
    let height = parseInt(svg.attr("viewBox").split(' ')[3])

    // Main group for nodes and links
    let main_group = svg.append("g")
        .attr("transform", "translate(0, 50)")

   // Place to store node degrees:
    let node_degree={}; //initiate an object

    // Calculate the degrees
   d3.map(data.links, (d)=>{
       if(node_degree.hasOwnProperty(d.source))
       {
           node_degree[d.source]++
       }
       else{
           node_degree[d.source]=0
       }
        if(d.target in node_degree)
       {
           node_degree[d.target]++
       }
       else{
           node_degree[d.target]=0
       }
   })

    // Scale for node sizes
    const scale_radius = d3.scaleLinear()
        .domain(d3.extent(Object.values(node_degree)))
        .range([5,20])
    const scale_link_stroke_width = d3.scaleLinear()
        .domain(d3.extent(data.links, d=> d.value))
        .range([1,5])

    let color = d3.scaleOrdinal(d3.schemeDark2);

    // Adding links
    let link_elements = main_group.append("g")
        .attr('transform',`translate(${width/2},${height/2})`)
        .selectAll(".line")
        .data(data.links)
        .enter()
        .append("line")
        .style("stroke", "black")
        .style("stroke-width", "0.5px", d=> scale_link_stroke_width(d.value));

    // Adding nodes
    let node_elements = main_group.append("g")
        .attr('transform', `translate(${width / 2},${height / 2})`)
        .selectAll(".circle")
        .data(data.nodes)
        .enter()
        .append("g")
        .attr("class", function (d) {  //applying class 
            return d.id
        })
        .attr("fill", (d,i)=>color(d.Country))  //coloring nodes by First Author's Country

    // Using scale to size based on degree of node
    node_elements.append("circle")
        .attr("r", function (d, i) {
            if(node_degree[d.id] !== undefined){
                return scale_radius(node_degree[d.id])
            }
            else {
                return scale_radius(0)
            }
        })  

        
    // Using charge and collide to avoid node overlap
    let ForceSimulation = d3.forceSimulation(data.nodes)
        .force("collide",
            d3.forceCollide().radius( (d,i)=> scale_radius(node_degree[d.id])*2.2))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .force("charge", d3.forceManyBody())
        .force("link",d3.forceLink(data.links)
            .id(function (d){
                return d.id
            })
        )
        .on("tick", ticked);

        let linkStrengthSlider = document.getElementById("linkStrengthSlider");

        linkStrengthSlider.addEventListener("input", function () {
            let newLinkStrength = +linkStrengthSlider.value; // Convert the value to a number
            ForceSimulation.force("link").strength(newLinkStrength);
            ForceSimulation.alpha(1).restart(); // Restart the simulation for changes to take effect
        });


        let collideStrengthSlider = document.getElementById("collideStrengthSlider");
    let chargeStrengthSlider = document.getElementById("chargeStrengthSlider");

    collideStrengthSlider.addEventListener("input", function () {
        let newCollideStrength = +collideStrengthSlider.value; // Convert the value to a number
        ForceSimulation.force("collide").strength(newCollideStrength);
        ForceSimulation.alpha(1).restart(); // Restart the simulation for changes to take effect
    });

    chargeStrengthSlider.addEventListener("input", function () {
        let newChargeStrength = +chargeStrengthSlider.value; // Convert the value to a number
        ForceSimulation.force("charge").strength(newChargeStrength);
        ForceSimulation.alpha(1).restart(); // Restart the simulation for changes to take effect
    });
        
    function ticked()
    {
        // Updating nodes
        node_elements
            .attr('transform', function (d){return `translate(${d.x}, ${d.y})`})

        // Updating links
        link_elements
            .attr("x1",function(d){return d.source.x})
            .attr("x2",function(d){return d.target.x})
            .attr("y1",function(d){return d.source.y})
            .attr("y2",function(d){return d.target.y})

    }

    // Zooming
    svg.call(d3.zoom()
        .extent([[0, 0], [width, height]])
        .scaleExtent([1, 8])
        .on("zoom", zoomed));
    function zoomed ({transform}) {
        main_group.attr("transform", transform)
    }

    let nodeSizeOption = "degree"; // Default option

d3.selectAll('input[name="nodeSize"]').on('change', function () {
    nodeSizeOption = this.value;
    updateNodeSize();
});

function updateNodeSize() {
    node_elements.selectAll("circle")
        .attr("r", function (d, i) {
            if (nodeSizeOption === "degree" && node_degree[d.id] !== undefined) {
                return scale_radius(node_degree[d.id]);
            } else {
                return scale_radius(0); // You can set a fixed size here for the "fixed" option
            }
        });
}
}

