export const DASHBOARD_DUMMY = {

member_application_count: [
 { Count:11246, Status:"WAITING_FOR_APPROVAL" },
 { Count:5712, Status:"SAVED" },
 { Count:244788, Status:"COMPLETED" }
],

scheme_application_count: [
 { Count:238, StatusCode:"SUBMITTED" },
 { Count:9, StatusCode:"SAVED" }
],

member_dashboard_data:{
 pending_approval_count:200,
 approved_by_hq_count:500,
 card_printed:200,
 approval_delay:300,
 card_delay:500,

 charts:{
   districtwise_count:{
     pending_approval_count:[
       ["Chennai","Coimbatore","Tiruppur"],
       [23,23,34]
     ]
   },

   member_by_gender:{
     pending_approval_count:[
       ["male","female"],
       [231,23]
     ]
   }
 }

},

scheme_dashboard_data:{
  eligible_applicant_count:100,
  applied_applicant_count:150,
  pending_approval_count:200,
  member_applied_count:300,
  benificary_applied_count:500,
  approved_applicants_count:390,

  charts:{
    districtwise_count:{
      eligible_applicant_count:[
        ["Chennai","Coimbatore","Tiruppur"],
        [23,23,34]
      ]
    },

    schemes_by_types:{
      eligible_applicant_count:[
        ["Education Assistance","Marriage Assistance","Spectacles Assistance"],
        [120,90,60]
      ]
    }
  }
},

scheme_dashboard_amount_data:{
  eligible_applicant_amount:100000,
  applied_applicant_amount:150000,
  pending_approval_amount:200000,
  member_applied_amount:300000,
  benificary_applied_amount:500000,
  approved_applicants_amount:390000,
  amount_disbursed:390500,
  amount_sanctioned:395000,

  charts:{
    districtwise_count:{
      eligible_applicant_amount:[
        ["Chennai","Coimbatore","Tiruppur"],
        [20000,30000,50000]
      ]
    },

    amount_by_schemes:{
      eligible_applicant_amount:[
        ["Education Assistance","Marriage Assistance","Spectacles Assistance"],
        [50000,40000,35000]
      ]
    }
  }
}

}