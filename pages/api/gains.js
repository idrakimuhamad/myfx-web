import axios from 'axios'

export default (req, res) => {
  const { session, id, start, end } = req.query

  axios
    .get(
      `https://www.myfxbook.com/api/get-gain.json?session=${session}&&id=${id}&start=${start}&end=${end}`
    )
    .then(response => res.status(200).json(response.data))
    .catch(function(error) {
      // handle error
      console.log(error)
    })
}
