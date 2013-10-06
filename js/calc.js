function show_cdn_plan_notes(cdn_name, plan_name, extra) {
	$("#traffic_info tr:contains("+cdn_name+") td").eq(3).html(plan_name + ((extra > 0) ? (' + extra $' + extra + ' ') : ''));
}
function max_and_cachefly(trange, cdn_name) {
	var traf = $("#traffic_volume").val();
	var result = 0;
	var last_excessPrice = 0;
	$.each(trange, function(index) {
		if (traf <= this.included) {
			result = this.price;
			$("#traffic_info tr:contains("+cdn_name+") td").eq(3).html(this.name);
			return false;
		}
		else {
			$("#traffic_info tr:contains("+cdn_name+") td").eq(3).html(this.name);
			var traf_excess = traf - this.included;
			var next_plan = trange[index+1];
			if (typeof next_plan !== "undefined" 
					&& traf < next_plan.included 
					&& traf_excess * this.excessPrice + this.price < next_plan.price) {
				result = traf_excess * this.excessPrice + this.price;
				show_cdn_plan_notes(cdn_name,this.name,Math.round(traf_excess * this.excessPrice));
				return false;
			}
			else {
				result = traf_excess * this.excessPrice + this.price;
				show_cdn_plan_notes(cdn_name,this.name,Math.round(traf_excess * this.excessPrice)); 
			}
		}
		last_excessPrice = this.excessPrice;
	});
	result = result ? result : Math.round(traf * last_excessPrice);
	$("#traffic_info tr:contains("+cdn_name+") td:last").html('$' + Math.round(result));
}
var 
	plans = {
		Cachefly: function () {
			var trange = [ 
				{name:'Plan 1', price:  99, included:  256, excessPrice: 0.37 },
				{name:'Plan 2', price: 299, included: 1200, excessPrice: 0.25 }, 
				{name:'Plan 3', price: 409, included: 2048, excessPrice: 0.20 } ];
			max_and_cachefly(trange, "CacheFly");
		},
		MaxCDN: function () {
			var trange = [ 
				{name:'Plan 1', price:   9, included:   100, excessPrice: 0.08 },
				{name:'Plan 2', price:  39, included:   500, excessPrice: 0.07 }, 
				{name:'Plan 3', price:  79, included:  1000, excessPrice: 0.06 },
				{name:'Plan 4', price: 499, included: 10000, excessPrice: 0.05 } ];
			max_and_cachefly(trange, "MaxCDN");
		},
		MtProCDN: function () {
			var traf = $("#traffic_volume").val();
			var result = 0;
			if (traf <= 200) {
				result = 20;
			}
			else if(traf <= 10240) {
				result = 20 + (traf-200)*0.15;
			}
			else {
				result = 20 + (traf-200)*0.10;
			}
			$("#traffic_info tr:contains(MtProCDN) td:last").html('$' + result);
			show_cdn_plan_notes("MtProCDN","Default Plan");
		},
		KeyCDN: function () {
			var traf = $("#traffic_volume").val();
			var result = Math.round(traf * 0.04);
			$("#traffic_info tr:contains(KeyCDN) td:last").html('$' + result);
			show_cdn_plan_notes("KeyCDN","Default Plan");
		}				
	};
function recalculate() {
	if ($('#traffic_info').find(':animated').length > 0) {
		window.setTimeout(function () {recalculate();}, 10);	
		return;
	}
	$("#traffic_volume").val($("#traffic_volume").val().replace(/\D+/g,''));
	if ( $("#traffic_volume").val() > 1) {
		$.each(plans, function (){
			this();
		});
		$('#traffic_info').sortTable({onCol: 5, keepRelationships: true, sortType: 'numeric'});
		$('#traffic_info tbody tr:first').addClass('success');
	}
}
$(document).ready( function(){
	$("#traffic_volume").keyup(function(){
		recalculate();
	});
});