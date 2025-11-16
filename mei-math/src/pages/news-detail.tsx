import React from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import { useNavigate } from "react-router-dom";
import "../css/news-detail.css";

const NewsDetail: React.FC = () => {
  const navigate = useNavigate();

  const relatedArticles = [
    {
      id: 2,
      title: "Cách rèn luyện tư duy logic cho trẻ từ 6-11 tuổi",
      image: "data:image/jpeg;base64,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",
      link: "https://www.vas.edu.vn/tin-tuc/cach-ren-luyen-tu-duy-logic-cho-tre-o-lua-tuoi-mam-non-tai-vas"
    },
    {
      id: 3,
      title: "Học bảng nhân không còn khó nhờ 7 mẹo thú vị này",
      image: "https://via.placeholder.com/300x180?text=Bảng+nhânhttps://mgs-storage.sgp1.digitaloceanspaces.com/vas/media/XfXDYP1mVV6hHDaNnpeaMhq8gFbnU0mKng7OExJK.jpeg",
      link: "/news/meo-hoc-bang-nhan"
    },
    {
      id: 6,
      title: "Luyện tập Toán mỗi ngày: Tại sao chỉ 15 phút cũng đủ?",
      image: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxITEhUTExMVFhUXGBcXFxgXGBUXFxcVFhYXFxcXFRUYHSggGBolHRUVITEhJSkrLi4uGB8zODMtNygtLisBCgoKDg0OGxAQGzImICUtLS0vLSstLS0vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAOAA4QMBIgACEQEDEQH/xAAcAAACAgMBAQAAAAAAAAAAAAAEBQMGAQIHAAj/xABCEAABAwIEAwYDBgMGBQUAAAABAAIRAwQFEiExBkFRIjJhcYGRE1KhFEKxwdHwBxXhI0NicoKSJDOisvEWF1Rj0v/EABoBAAMBAQEBAAAAAAAAAAAAAAIDBAUBAAb/xAAuEQACAgEDAwMCBQUBAAAAAAAAAQIDEQQSITFBUQUTImFxFEKBsfBSkaHB4TL/2gAMAwEAAhEDEQA/AGuOYuaUwBA6lRcPYx8bNPI/kocbtc9MgakhIMAtbhjpa3LO8rL0XqN0/lJNrJ9GvTtPbopwTUZeS8PpsLtfqsjA6bpJCWU7WuXBxd6Qnlm5wHaK3dNfNttR2nznqWlgqo1ynvx+5xfj/CzSuYY0w4Tp1C9gttUgdkrquJ4bTqOzOgwoGW1JmwCv/HKtcsn0V1tXEY8CW0tXwNEWMJe7dNW3LRsFsa7ipp+pP8qND8Rb9hUeGaZ1ciaWD0GbNHsijPMrGXwJUVmsnPuIdO6W6XUhu6rWN7LVVbjHKknWFa7+i4tMNKpb8BuXOMM0nmUyh5XyJdSpZSiefiVQ/eK8y4ceZR1vwrXO8BMqHCD+bvYKhWQRHKi2XYRtrHqU/wCHK5JieaLo8GDmSnuCcOMpGQEc7ITjtRynTWVz3sPobJXieH1XHsmArH8EBStal5XQoUH1aKBdcJ/EHaEnqU+wiz+CwNPIKwObCGqtDtCmrgS/GORdc3PIc0IMPpTmc0SfBPvsrVDUtASvPE+GNrn7PySyyO1sqTRoEWxzAsspABD1aAJ3AXpSfRCq6q5ybnwHCq0LLKzSlbaJnvSjKNKAuKPHIppZxELhqXY7cClSc4cgpKlSOqqvGNy97MrGuK6ljuc2vwH/AM1f1C8lnwn/AClYU+5FexjtzWxyQjqlNvRLKjqhSXHi9oHaKkomm9seC+yLrhubyWO4xhjeYSq64kaNlUnVT1UT3Kv2l3ZBLUS7Dy44kcdkL/PHFJXrVrkca4LsIndZ5H385fyhbjG6vUJCKi3FZPVcPBO77f6mXnAr74pAd11V7ZaMyiIXIuGbn+0IV8oXdQDQFQOUarWsGtBStpTyPXW7egWjaDfBIb3EqrRMH6qm4zx6aLspmfAIrLO6iHVBdHJHUDlHMLHx2DmuK1v4jvPda8oOrxndu7tJ3rmU7nJ9inbFdzupxGkOY91H/PqQMAglcBucfvzu0tH+Uovg3E7mpdsYXOcXcukany0Rxc2uMC5KtdTuhxUkwAh7jGHN5j3BKW39fKIb4T5x9T4JQxjnOkgkayfLSAPP98kXKfUXuyuENLzG6g3e5s7bak7AAbpZV4nqZo+NlExMMOojSCPP2UFegXuzOcWhukDfx1/f1SPFMCfUBhrQBJAktgc5II/Ne9xroC60+pancTVBld8QvDhIAyDpqNJ5hZfxIWQ7NmB8dZ3iOZ8Fz6zuXBtam9zYptaW5SJGWWxMk69n2S28umtqQKmZpAeAXQB2W9nNy16dI6ot7A9s65Qxg1u5Vg9HCfqI+qZYbaPeZdUHkFyTh/EM1ScziZ5tcck65SQIHouoYRiQa0aNPKd9UStYPsxz0LP9nbTbJMwqtiPGbWEhrSUZjGN/2RAidtOS5hf1pcU6HKyJulsltRbKnHTj/dj3QlXix7vuBVQOW+ZFsTEO6a6M6b/Mz0Cylsryn2os9yXkYVaROwSrHsOqPpnK0kq907YDkivswI2CTXp9r3ZKrb1KO3BxFmA3J+5HmUVS4TuDvA911f7EAdlI21Tt0xPs1HMKXA1Q7v8AYIyjwCPvPcV0b4AXvgr2Z+Qvaq8FGpcCURuCfMlHUeD7cfcHsrb8FbCihzJ9wlCtdkJMPwKkxwhg9lYTbMjuhaMowiHERuigsCreegBWtGHQgKj8XcDW9QiqWiR+9Vfn1WjchVjjHFmtouDTrCZPElhgVpx+XgpNDCLans1vsFM51Acgqq/EupUZxNq8tJUuoh6+99EWi5r0XCAAmfC2AspZrgthzgcvWDzHiY9lWeFf+IrgEdhgzv6ZRy9T9JXRa1VrGZqxDRG3U75QOn/jkhnGEOIoZVO2zmbBK1PmdvXfoOf5+6FddQ3TQaRp7QBuY2WlxdmrqQQ37reZ9OX5LalTce06GjwGoHmdvxSGyyKwBPaQMziWAa5nGIHlI8d9EFiBLxlY1zm6Sdgddp5+gTK6r0wOyHPI5hpIB5yXwAfEpZf2bKg/tajzO4Do32ADdP30S2GVa+sqIloDWkzJ1yxBlxAOvLz2VYFFr3ZA6Wgk5uZEbuMaTCseKChRkUKZ5tkhz3O676BaUcFNBhqVZNVwlrI1Y3cF/Rx6LqOMhsanwhUa0ODtMo65M3MHfRyvvD1wxzR1I29Oqp1taZnOIGoiP87C4n3bUHsFYMMZGTxnKehILo8pB08USYD5HuI3JY0zqD66KjXdYFxhWjH31DTBDHmQORKo918Rpk03jzBVcGsEFqbYa1ylYUop3kb6eaPo3AITEyacWjo68tcy8kFp0RzVJTqDqFR6OMVKp0co/tjy4tLyku/6Fv4dcJyL2+ozqFFUv6Q+8Fy7irGn21P4nacNOfVUp38QnH7h9wg/ESfRBfhoLrI71WxuiPvBCv4kpjZcErce1vutHuhjxRe1O6D6NJQytsfgNV1Lyd7q8VN5D8EFW4ujmB6riQZidXlU+gWlTh+/Ors3q8oN0/6g8QX5Trt3x01u9Ro9UPQ4v+L3akjwXGK+CXA3YT9SrTwJbuAcHNIg89EyEHJ8tibLlFZikdHF8XfeJ9UHieFm4AbJA8EdbWAa0OTC2ZqFRCuMee5HZfObx2Kp/wC3bDu5/ut2fw5o8y4/6ir+AsFqLczyihBw/wAN0rRrywauIJ5nsghok+ZXq9p8R+Z3acNtTkYOg6pldXAaHOOzdPMpRRvnVJy6AGJ5bSdegnfwS3yMXBOy2Y0l57R2k6ADmB+iEFavUdLYZTGw2c4fM8nRrfDU6b8hOarY11HtMfgFq+5L9AC1u/Tb7xPTolsahXiNmyc9es+oGkEMBin4AjYieqDfnfGRmXNrJHdB5nN949I0G+6Zm1z1BI7De6zYuPJ7ydQPrzWl6QectnUjQEnSB1JMj3O6AITWdBrD2e25ujqzh3SeVPTU8tN9OWqAxus0vZS3c9zWwTJkmST4D8im9e5c1gOUNc4ltNg5cvfbX0SfDLMNrOrPOZzZa0HUBxGpHpp6+JXjoZc0RSY14Hdd8Qj/AAgED6AA+SJtIgtH3XEezzKhfVFUEnVriBPUaA+hzH3W+Dtz3TWfM+D6j9ShbwdSydifYMjuhQPwikd2BMytUwMQ3HCts/vUmn0CAr8B2bv7po8hH4K2ry9loFwi+qEP/pij0+pXlYF5eyzm2Pg5Ng4yPhH3QioD1UV1SyvlE3jZaHdEUl88eUTwb2fWLFnFFl8a3e3q0rnvCvA7rgZ6hLROw306ldQvXxSJidFWsHxb4WZpIGpK5p9LOxcPAWr1ldL5TYfhnBNrS+4Cep1P1Tf+X0WbBo9kgr4lWf3XQgalpWf3qp9FbH02P5nkzJ+tP8qS+5bX3VFv3gld1iVGe8FX/wCSt+89x9Vs60t6ephUR0dUexLZ6lbPhSf6Id2d1Rmd0vN41txAiCkGIY0xohgSfCcRLrgOceYQz9tcJB0x1Ek5yfB2m3dNMBT0+SAsassCMU7XJZGWUmNqT9AtnugE9AT7IOi/RSOcSD5H8EO0buKrjN2XxS1DRJqHyGZw/I+g5lBV8SFOkwbFwzkeerAfSCtKlcPpCdPiPcw/5fiEH/oaq3id5ne92g7R9G6DTyAHsp8lWOSyW9/JJPdYBz7zzoB5CJ9UbRvCRDSMzuZ5Ad0R03Pl5qlWeInLk+8dT1zZXkj8E2pXuTNEEwQ0acpH+2WlA2GkPLsOdlp0zzl7ju4TP11P+nyRT+0BEANOk7SB3j4Dfx06oTB6wFLMTmc6NdsxPTnGoHr5qa6qCHazAA9XbeWkFcPCwFpmqZhgdlB3DWN5+Jc4T4pKK+WkDuXDTziZ85n3RWIXEUCPnkDyBk/9oSapUmo1p2axpPmYJ+jY9UDkMURrRflDGDZsE+n7+isv8NsOz3TXHX4YLnH/ABBrWj6kexVRZUiOrp9AP129+qeWOKG2MMcQ7Z0eHX1krtcHOWALLFXHLO2lYXMbTjWsN3T5p1a8bT3mD0VbokIjrK31LnCxlSa14moP3OXzTWjdMf3XA+qU4NdUUQthLoyWF5ZXkARzrEaa9T1ZCnvKjTolwzzARpOUYvwTOShZJeTarWbkgrmPEuZtaRor9i9T4QzOVGxiuKpkK2qCjF/Uz7rnKyKa6AdvizxzRBxh/wAyVGwd8wXhhx5vR+5JHHTU+QqvizvmKAr4gTuVJ/L6fN5Pl/RFW+COd3KL3ehH1KCU5MZCFceiENSqXbSt7RjmkOV3sOBrqpu1tMeOp9lacL/h1SbBqkvPjt7JWORzs4xg34euDUt2kbwFYKZhkuQdCxbQORogJk17SQ0ndNxlkkfjlG+HVA8aJi2notLSyazZGMpr2A8nLcepGhTE6FjqkePehUatdkjIIGgJ/wAI+U+kldf41wV1bMWagDKRzDjkIMdIK4rc0XUnPa8doO1ny098pWdL4yaNaK3wUgjC7gB4ceRHtMQfSUfcV9T2twAOp70/XX1VfpgiN9A4nzh36o9rS4jpLT9AD+CCU0MjS2W+3vO0GDZrRHmXQ0ecR6u8EZcXkyxvUyfWIHoISjC7Z0kwZn8HF0Jvh+HGBMxz+v6qd28lCowuRfi1Hsskw1oObydufxShhGd5PlPSJ09p9k5xh+paeTfd24+oSWvsf8Qn8vwIRKRxwDKcZmE6Aan/ACgE/kPZaVrnM9zupn3Vg4Uw9gitXaHN2DCM0zmgub67FKeKDQF08W4aGdmQ3uh8doNjl5c5Veisi5NIh9SonGtSfQxQejqNUpVbuTCgVpmGxpRrFMba7c3YkeRSeiUdSK6eyXb7dU+YryDleU2C3L8gllhLz2nI3C6YFSCrE2kISGsMlaUMVxgZPrkE4lwplQ5XDQpM3ga1LO7qDvJlXPEqeYAoSlp2eq9ng44rInpcBWZAOQe5UzOCLJv90z2TizuN2zsiC5e5O8CyjgFuzu02j0CLZbMGzQpiVhEogORgBbtavALcJiiKchJjFOHAqO0wsPcKkmQpcZouJB5IvA38kWMCs5Y0ps0UzWrDQpCQBJ0QyeB0ItvCKM7GXMxOrTzf2Za0OB+YDQ+Gmnt0SzH+DKd3VNQPgaAgRIInQ+5Te3w1tK9fcvIcar2taI7jdAd+ZVjqWLJc5og8/HzWfbKNre3sbNFVlEFv7nKm8CEMc2ZOmvWCZHqCi8N4Uh5MDLBB6z4K23VZ7dgD6f1QFvjEOIqFtMg8xoRyOYkcuSj2ZLd4ThuCtZ4pk6ybEAKG2xBr9GuDj/hiPcJixqJRQLbZReK8ADMtRp3MfTT8FDgPB5fDq8tbyHMgc9dpKtuNAaPd3WatHV50BPgEowviN1WRLSQSByJAcR67JU2kyqmuUllCXjmu+2DaFNrmteDNTWCPkY7m6Nz6dVSqQXZL91N4axwDqbu8x2oIjodj4hc84p4bdbOz0wXUHHsu3LD8j+ngTutDRW142JYf7mR6rprs+63lfsLqBR1F6WUnoltZaZ88xxReEYyokdO4CIZeaLoOToOdeQXxl5TF+C8OckmMt1BTVzkBiTZagXUZPlG1J+amgartJWbJ5yEeCrdpc3Jr1GubDAeyevVGkLcuBlb2lT45qZuyQNPzT3MhLR+iIRJAuRvmWQVoApGNTowJ52GwUjQstYtmsRvBPvbBsQZLCgsKoEGVPiGLUKctc/XyJHulD8cbALDtJ6So7tXVBdcmvpPTNRa+VheWWW8vW02kzr0/VVDE8WqFubMdHyY006JbjWLlzW8u1rBlL7vEmtouc7aeW8nZY1+qla/ofU6PQQ08fL8jnEsRzVKdMSd3k7QOStlhiLalIukZu67wIH5yD6rndpVDiyqTA+EPeP6L3DuMfDdWdIh74IPQAAEeI190FVjjJj76FOCx1RdK4Gq1Fm13eAPml4xRpg5KhB2IGYfQpjTuwQIkeBBB9k7JnyrcXygqhQDdgB5Kd1QAIP4zo2S+9viAXH7onwHiV1JgSlFdxNxpi3aFNpHZGZ3mdGD2zH1CqnCTXfHLgey2Z8Zn9+qCxO4c5znE95xJPj/SPojuDroNzgjvadPqpZvOWbVNeytIvVPV0+up/LmndtXaBvOmqpBJNTfQfXzTCniQojM4TOgbuT0ACGMsAyryKeN8FY2bi3HZn+1Y0d0/OANm9ekqmi48V1fDater2i4U2cmtifU81Q/4nYfToV6bqTMjajTmyiG/EadYGwJBBgLX0ercvhL+5836n6YoN2w/VCdt0tjdpIK6ybjRaG8xfYOvfFXkLmXlNks2HRnOUNQKSERQsXO30CLhdRaTlwhW1oBhTUsNc7WIHUp5Ss2N5SepUjilzu8D69L/AFCihgwbu5Suw5vIlGuUbile/Ndx/wCGr8ABtCELfXPwxynqdh5o29usojSfwVWv7wGfzQ266ajhdRun9IqlLdLp4B7/AIuuKLo+DSqNiT8Nxzx/kdE+hKKsuI/tA7L4MatgNInw3VWx1jS0EGHjVp2g9B5qvXdbOxtxTdkqNgGDBgn6ifxUL1VkuGzar9O08eYQWfsXjGsWY17aTySSJJ0geB6pVcOdEtEjqNlXnXXxGxV73zePVLKlxVp6B5y+B0UzbbLo1pIcYnetAg6SfYpJi1074ZEyBqPRG4fgF3eU3Oo0i8DcyACejS46lXnhz+F9N1mRd5hcPBOjjFL5QANCeu6pp0spckeq19VC2t8/TsVGyqF7KTNg1gLvEkTH1UeCWLape+XgMq5XECe8dB0lFU7c0S+mTL5yiATMdkQEy4Rs8tCrnY4O+OSREOlrQQCQQRrGhHNepq3SafY9qNTsrTi+v++4dhNJxfcUWOh7aTRm+WoXuc0GNjA180yw+rVGlRsEbkkR6Hmqzwvci1fXzuc8VamYn7zemYbzv4J/dYnRaM2fy0OseOy0a41+2nnoYGond78ljq+Pr2G9xijGt1MKnYzinxuy3s0wZP8AiPUoOvemq+c2k6NBnTy5p7aYIWjPWbEDMxmaHFw1EsZ2zsIaIJPRTWWu34V9PJo6fTLTpW3vnsv51f7FExmjUa8UywtO4BiYOuonTyKPw61LGA89/qrxVwp1SlmdJc3tRkr6OdOYNzM0nXnpCQ1aYDWj97/opL69jx2NTTaj3Y57ktOqAC4gDr+p8FBhj3VH/Fdts0H7revmdPogMeqwxjJ7zwD4iCSPXRE2F1DTrA0Sew7BZcLqxU02HJWC7tKFekaVYNex+4PjsQdwRyI1CquDmW5vmmPIabecp5aUwN/6IoycXwKsgpLk4ZxRhLrS5qUDMNMscRGeme67x00McwUrNTRfRGM4ZaXdI0q5aQe6dM7Hciw8j+OxXBeJcEqWdd9CoZjVrhoHsPdePPpyII5LXp1G9c9T57VaT2nldDqcrywvItxNg7BSotbsNepUkrTMs5ktybHxil0MkrQlZLlG5yFsJIw9ygr1Q0St3uSW/wASZmySS75WNc9w8wwEjzKXKWB1Ve5/QEvc7jPtGp9kivqT4JgyOccv1TO9qEbhzZ2zNcwnwGaJVDx976T3Q52VzZ3OhkAj0lQ2GxTHd0IcVvTl/e7T+kJJa1R8B0kSSYn8kTjFUGkCD2nkEjoYOb9UBY4XUqEQdOQhDCKccsfOyMOCB9y+poFZeDaTWvP2i1FdpiJJ7Pk06FWPAuFGNALm6qz22GNbsE6DaeUjOv1DmnH9uB1hF7QDGsptFMAQGwGgeAjRMaly1sSd/VLMKwkv1OjfxPgi62FPG3aHhv7KjUarUwrzXDL8/wDDHjpqHZiUv59yo3dk5lR7snZLic0AiCZ16esKDD6DXOqtPOo14lsnuN1AeQeXIkLXiPiE/EbbUXRL2tqvHLtAFjfzPojW4NVaXnslpykRI1Agy2COmqLR6p3R+awynV6KenjF9pdBFjuGOcx7qYDaw5uESeZ0btHiqSbwvaIEETmadmnnoV1BreZ0P+tg9S3T3AXLMUvKTa7mhpcQ+CR3ASTE69rZHqocJxHenWRTfuPpjGfL44LNwPTqOe6YgM3ylwEuEFwykDY6q11HOq1BSpgFjILy0UnNmdG9gsdIInmkWAVclIZMgq1SSCXBuVjTBdnaczfIggkhP7WiwNDQ8OjUlzrRznE7klzRJPmjohiCyK1lm6147cDJkMZA0jYn7TRPuMwcqtxBZBgzty5TAyh0uDjvIcGuj0VkY2BADmz8rarfU/Z3lp+iwajgIl4Hia4nw/tKbnf7SEV1SsWGDp73VLK5OP8AFVc5GQZyvB/FS4NdfFIpt5ga/KAe0T++isnFuBUXNOUFnUCY05kOc4z5kHaQOaLA8PfSY9zaZytGao7TZpIPsQT6KCVDjHD7GrXq4ynlPCfnyWuzmezsNBtoBEBNJe85QdOeyQ2N1pITOljVFvZzdo/daCT7CSVNgsyPbOzYwiYlF3WHsrNy1qVOo2QYe1rxprPaGiq9XGapMU7d3m85R7b/AEU9MX7myH0meEOcPfRHF46C7K93X/JaP/T9v8v/AG/ovKHLdfO32P6rys9xmT+Hh4LLKxK1XijyTYMkrSo4AFxMAAknoBqSvSg8XtPj0KtEmBUY5k9MwIlcbCSWSh2PGRxO/bZ0C6lbgOdUftUqNZyafuAkgdYJ2K6ZaWlOk3LTYGjoB9T1PiVxn+GPDdxa4s8VmFuWjU1g5XS5jQWu2IOZdm+ImQS25OWt79vbsR31Jr2lrgCDuDqFyrjbCcktM5ZBYTrLTu0nmQR7ZV1ao6Uhx+yFamWGJ3aejuR/JJuhuQ2i2Vb4ORWGEZomT5/VXvBMGawDTVD4ZZZTqNZj2VotmKWEPI+21skpU4W5ICPw+xz6nRv4nwXrvB3jVhzDpsf6r2rjfGrNMcv9v0J67anPbNhVnizCACMn1b7pDxZxSBUbaUHTUd/zHj+7ZEkA/ORz5T1SXijF3W7IY12cz2oJazWCSds0jQe/jV+GGlzn1NS49gHcnYuPj936oNFrrnVP3Vyl8ezzwln++f0G6n0lbI3Q/wDLkk/ty2/8Y/U3ssIdVu3H7oqEjxM5vZdRaIEJdhGHBgk78/0TGo5N09bhHkdrNVLUSWeywgS4YNVSsT4AtqjzUpzTqSTPeE9Yd+RV0qaqMsTJNsmhw8ormEYTVoTJkw1oIqVG9lo+TKYklxgdVO67fsC71+Mf++iU7yrDqLXbj9+BT4ahrhoTOjc85Ebag37Gbyok+wFN/wBVq6vylo6xA+grkn2KbXOECOy+oPNxePZ8pNcYfcNPNzY1ylx9Ms6n/Snq2LE7JIHrNDtNhp/TSPHaBvtvJ7bZpt6zQIb8N7T/ALCDrzI5nlsEsZOaNRB5bg6gR1cdQOgBd0T+3twWZCBDmlsA9locCND5Hfc6oooXJnz5Qx2sA1hecoiY3LRylXLh66YKmZpysa0vcddQRuTzJJ2SbHv4fXltUazL8Rj3BrajZyyTpn+T10XR+GuC7alRDHE1XyHOJJDZ6NZsWiToZ11UWojFfc1fTr5yznlEFrjtaqctFlFkjM01nlrnD5gxoJDfExPJG0at2e9f2zD0awuj3ePwVgpUGAQNNeWh9evqsPYRqHOH/UPY7KTODTfIR/a//KZ/tH/6XkXmd1b7Lyo3GftG4KwVqsymkWDywsErUlcPHnGIWw5Id9Qblavvm5dE2MkkBtechkJLi1wGls8zCK+3yICr/GVN5pMezdjwSBzHTzS7JfHKHVwzJJm1WlFSRs78eaYUP3++iAw29ZWptcNY5DfyTC2qteJaZjQ8iD0c06tPgdVla7UTqivbXXv4Ka6sv5dgXE8TvwOy4Bn/ANbQIHiDLh6FJhWq1O1VqPcOQc5xB8YPJPcUvxRY5x3AJ8gBuqrhl8alFr3GXuLp8XBxCQtRqLaHN+VHP3Tf+i2GprrftRik8Zyks4/jLdgmIBlu7mRUcAOZLg1/4vK9YWJc81X95309ENgeHkDM4anUKxUwIWrW5OuMZdkjJlFRlJruzGWNEPXKKLUNWTGcRAF4hbNaeWpU9OzJ3MLii30Cyu4MAtsqLfZgcysfZehXtjO7kRhgUVQsGmcT7oLEKtRpyu0HhsR57lLs5G3/AISpWYeCmvTblnIxvHUtiM58BO/jyQbA4bAgDbUmB57+qEqXNRu+o8pUDsUZPaYQfAkIHdLpkohpILnGWNK9MkSHFp56oU0qnKt6HZQMxqjsCQfFTC5pv7rgDHol7ilLBl1Wo3vgOH757qRly12gMeBQri9vl+XgoqlYEagNPX97LmTuC0ZD0+qygsw6rypM4sQK0esTos/sp5CaleJWVHUXjwPcCUnqggzy28inFRKcRBEwCQd41IPVePIiEtcCDo7TyP7/ACRdWKjHM2JGh8eR94SJ112cpmfzHNYdfuETp4jY/oluawNjBi7DsOuG1CWuyknUEc+abcTYq22otk5rpwOQjQtGvacebAdmmQSNtCiLLFg94YzI6o7RrXODcxgkCd405ApXfcCXFRz691dU2k6nK1z9OQaDl8gFnx0tzl1zHt/006bdO5L35JJdu7/tzgV8RYg6tRpNZq+4hx8GgBzp6AEtT/hHAQxjZ1A68ydzHIKHhzAQIklwaMoLt8uYuA8N/wAOiulKjlGiupW2lVLplt/V/wDFwZV0U75Wfovt/OTemyNlLCw1bApyQts0cULUKLcEHcU5B8QV5nkyM4lTptJcQI3JMKaxunVDmgtbynQnxg6geapmGVHOu3/GYQKbQaRdEZpIeQJ3iIPmrDXxLYDVx2aN/PwHiuxnlZY2cccIsZe2Fo3dLrGsB3t0wzg7I+ovogXGrfPTMd5uo/MKm1Lj9PBX4hUPFaAZVewddPI6/r7KXVQ/MW6GzLcGQ0r1wJBAj9NF6pd0T3oCEfQc7d0em55+X9VDUsG7DcH1UXJq4Qa+lSf3QPPYId1gBJDo8vfVA1KDhtI91q74o2/f71QuX0OpfUMZWrM2MjxU7rku3Eea9Z2lZwBII801t8FnV2pRxhJk1mojHhchvxB4LCb/AGIdF5W7DN98NA5/srLTO6yBP6fvksxHNNJzz/qoSFKtXH99F48QPCCuKSY5UNUavHCvXtMJJeW7zoCQrVcW8oOpapMkNi8FGp4bXp3VO5a4vcx7HQYmGmcoO0RIjxK6XeVjcPgf8sHTx8SEsZaDpqrBY0A1o0T5XznFQfRCVTCMnNdWSUKAaIHJTQs5VkBCkG2eAWwXgFuAjSFtmhCicxE5Vo9i80cTK9imHAgmPZV7Dv8AhfiOqOcQ45s7pcQIjLO4AifUq+upSgbvDWuEQlOLTyh0Z8YYssajqjW1RDaZEiR2nAjQx90c9dfJObe9ZCQXNKrShobmaBprEDkIhKqz7tx7OVg6AZnepP5Bedu0JQTLhfYsxjS4uAAEkkgADxJ2XIsX43m8DmNLqXde7US3q3rB1Vndgr6zpquc7wOw8hsPZT3vBlN9EsywTseYPVC7HLquBlajCSeTSpcAgH0nw5FDfaff/wASs2GDVWtbScJLRlJ8NhHpCs+GcPAauGvipVXJsvnqYx6ciG3tqlU9lunUp/YYK1sTq7qfyCe0bVrRoApfhp8akiKeplMAZaBEsoBSwsyjSE7iX4a8ppXk7Ag//9k=",
      link: "/news/luyen-tap-moi-ngay"
    }
  ];

  return (
    <div className="news-detail-container">
      <Header bgWhite />
      
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span onClick={() => navigate("/")}>Trang chủ</span>
        <span> / </span>
        <span onClick={() => navigate("/news")}>Tin tức</span>
        <span> / </span>
        <span className="current">5 Phương pháp học Toán hiệu quả</span>
      </div>

      <div className="news-detail-content">
        <article className="article-main">
          {/* Article Header */}
          <div className="article-header">
            <span className="article-category">Phương pháp học tập</span>
            <h1 className="article-title">
              5 Phương pháp học Toán hiệu quả cho học sinh Tiểu học
            </h1>
            
            <div className="article-meta">
              <div className="meta-item">
                <span className="meta-icon">👤</span>
                <span>PGS.TS Nguyễn Văn A</span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">📅</span>
                <span>15/11/2025</span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">⏱️</span>
                <span>5 phút đọc</span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">👁️</span>
                <span>1,234 lượt xem</span>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="article-image">
            <img 
              src="https://via.placeholder.com/1200x600?text=5+Phương+pháp+học+Toán+hiệu+quả" 
              alt="Phương pháp học Toán"
            />
          </div>

          {/* Article Body */}
          <div className="article-body">
            <p className="lead-paragraph">
              Học Toán không chỉ là ghi nhớ công thức và làm bài tập. Đó là quá trình phát triển tư duy logic, khả năng giải quyết vấn đề và sự kiên trì. Dưới đây là 5 phương pháp được chứng minh hiệu quả giúp học sinh tiểu học học Toán tốt hơn.
            </p>

            <h2>1. Phương pháp học thông qua trò chơi</h2>
            <p>
              Trẻ em học tốt nhất khi học kết hợp với vui chơi. Thay vì chỉ học qua sách vở, hãy biến Toán học thành những trò chơi thú vị:
            </p>
            <ul>
              <li><strong>Đếm đồ vật:</strong> Sử dụng đồ chơi, kẹo, hoặc đồ dùng hàng ngày để luyện đếm</li>
              <li><strong>Xếp hình:</strong> Giúp trẻ nhận biết hình học và phát triển tư duy không gian</li>
              <li><strong>Trò chơi bảng:</strong> Cờ cá ngựa, cờ vua giúp rèn tư duy chiến lược</li>
              <li><strong>Game Toán học online:</strong> Nhiều ứng dụng học Toán được thiết kế dưới dạng game</li>
            </ul>

            <div className="highlight-box">
              <p><strong>💡 Mẹo:</strong> Dành 20-30 phút mỗi ngày cho các trò chơi Toán học. Điều này giúp trẻ hứng thú hơn so với việc ngồi làm bài tập suốt 1-2 tiếng.</p>
            </div>

            <h2>2. Học qua hình ảnh và sơ đồ tư duy</h2>
            <p>
              Não bộ trẻ em xử lý hình ảnh nhanh hơn chữ viết rất nhiều. Sử dụng:
            </p>
            <ul>
              <li>Tranh minh họa cho các bài toán có lời văn</li>
              <li>Sơ đồ tư duy để phân tích đề bài</li>
              <li>Video hoạt hình giải thích khái niệm Toán</li>
              <li>Flashcard màu sắc cho bảng cửu chương</li>
            </ul>

            <h2>3. Phương pháp luyện tập đều đặn</h2>
            <p>
              Nghiên cứu chứng minh rằng học 15 phút mỗi ngày hiệu quả hơn học dồn 2 tiếng vào cuối tuần. Điều quan trọng là:
            </p>
            <ol>
              <li>Tạo thói quen học cố định (cùng giờ mỗi ngày)</li>
              <li>Chia nhỏ kiến thức thành từng phần</li>
              <li>Ôn tập kiến thức cũ trước khi học mới</li>
              <li>Làm bài tập ngay sau khi học lý thuyết</li>
            </ol>

            <blockquote>
              "Toán học không phải là môn học khó, mà là môn học cần sự kiên trì. Mỗi ngày tiến bộ một chút, sau một năm sẽ thấy sự khác biệt rõ rệt." - PGS.TS Nguyễn Văn A
            </blockquote>

            <h2>4. Học nhóm và tương tác</h2>
            <p>
              Học cùng bạn bè giúp trẻ:
            </p>
            <ul>
              <li>Trao đổi cách giải khác nhau</li>
              <li>Giải thích cho bạn giúp hiểu sâu hơn</li>
              <li>Tạo động lực cạnh tranh lành mạnh</li>
              <li>Vượt qua nỗi sợ Toán nhờ sự hỗ trợ của bạn bè</li>
            </ul>

            <h2>5. Áp dụng Toán vào thực tế</h2>
            <p>
              Giúp trẻ thấy Toán học có ích trong cuộc sống hàng ngày:
            </p>
            <ul>
              <li><strong>Đi chợ:</strong> Tính tiền, cân nặng, số lượng</li>
              <li><strong>Nấu ăn:</strong> Đo lường nguyên liệu, chia phần</li>
              <li><strong>Du lịch:</strong> Tính khoảng cách, thời gian</li>
              <li><strong>Quản lý tiền tiêu vặt:</strong> Lập kế hoạch chi tiêu</li>
            </ul>

            <div className="info-box">
              <h3>📌 Tóm tắt</h3>
              <p>5 phương pháp học Toán hiệu quả:</p>
              <ol>
                <li>Học thông qua trò chơi</li>
                <li>Sử dụng hình ảnh và sơ đồ tư duy</li>
                <li>Luyện tập đều đặn mỗi ngày</li>
                <li>Học nhóm và tương tác</li>
                <li>Áp dụng Toán vào thực tế</li>
              </ol>
            </div>

            <h2>Kết luận</h2>
            <p>
              Không có phương pháp nào phù hợp cho tất cả học sinh. Hãy thử nghiệm các phương pháp trên và tìm ra cách học phù hợp nhất cho con bạn. Quan trọng nhất là tạo cho trẻ niềm vui khi học Toán, từ đó hình thành thói quen học tập bền vững.
            </p>
            <p>
              Chúc các em học sinh có những trải nghiệm học Toán thú vị và đạt kết quả tốt!
            </p>
          </div>

          {/* Tags */}
          <div className="article-tags">
            <span className="tag">Phương pháp học tập</span>
            <span className="tag">Học Toán</span>
            <span className="tag">Tiểu học</span>
            <span className="tag">Mẹo học tập</span>
          </div>

          {/* Share Buttons */}
          <div className="article-share">
            <h3>Chia sẻ bài viết:</h3>
            <div className="share-buttons">
              <button className="share-btn facebook">
                <i className="fab fa-facebook"></i> Facebook
              </button>
              <button className="share-btn twitter">
                <i className="fab fa-twitter"></i> Twitter
              </button>
              <button className="share-btn zalo">
                <i className="fab fa-zalo"></i> Zalo
              </button>
              <button className="share-btn copy">
                <i className="fas fa-link"></i> Copy Link
              </button>
            </div>
          </div>
        </article>

        {/* Sidebar */}
        <aside className="article-sidebar">
          {/* Author Info */}
          <div className="author-card">
            <img 
              src="https://via.placeholder.com/100x100?text=Author" 
              alt="Author"
              className="author-avatar"
            />
            <h3>PGS.TS Nguyễn Văn A</h3>
            <p className="author-title">Chuyên gia Giáo dục Toán học</p>
            <p className="author-bio">
              Với hơn 20 năm kinh nghiệm giảng dạy, PGS.TS Nguyễn Văn A đã giúp hàng nghìn học sinh yêu thích môn Toán.
            </p>
          </div>

          {/* Related Articles */}
          <div className="related-articles">
            <h3>Bài viết liên quan</h3>
            {relatedArticles.map((article) => (
              <div 
                key={article.id} 
                className="related-item"
                onClick={() => navigate(article.link)}
              >
                <img src={article.image} alt={article.title} />
                <h4>{article.title}</h4>
              </div>
            ))}
          </div>

          {/* Table of Contents */}
          <div className="toc-card">
            <h3>Nội dung chính</h3>
            <ul className="toc-list">
              <li><a href="#method-1">1. Học qua trò chơi</a></li>
              <li><a href="#method-2">2. Học qua hình ảnh</a></li>
              <li><a href="#method-3">3. Luyện tập đều đặn</a></li>
              <li><a href="#method-4">4. Học nhóm</a></li>
              <li><a href="#method-5">5. Áp dụng thực tế</a></li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Back to News Button */}
      <div className="back-to-news">
        <button onClick={() => navigate("/news")}>
          ← Quay lại danh sách tin tức
        </button>
      </div>

      <Footer />
    </div>
  );
};

export default NewsDetail;
